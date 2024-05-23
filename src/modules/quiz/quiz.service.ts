import { EntityManager, wrap } from '@mikro-orm/core';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from '../app-config/app-config.service';
import { Code, CodeStatus } from '../mikroorm/entities/Code';
import { AttemptParsingState, AttemptStatus, QuizAttempt } from '../mikroorm/entities/QuizAttempt';
import { User } from '../mikroorm/entities/User';
import { CreateQuizDto, CreateQuizDtoUser } from './dto/create-quiz.dto';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { QuestionResult, QuizAttemptAnswer } from '../mikroorm/entities/QuizAttemptAnswer';
import { HTMLCampusParser } from 'src/types/interfaces';
import { JSDOM } from 'jsdom';
import { QuizAnswer } from '../mikroorm/entities/QuizAnswer';
import { Config } from '../mikroorm/entities/Config';
import { FinishQuizDto } from './dto/finish-quiz.dto';
import { QuizResult } from '../mikroorm/entities/QuizResult';
import fs from 'fs';
import { AxiosRetryService } from '../axios-retry/axios-retry.service';
import { UpdateQuizDto } from './dto/update-quiz.dto';

@Injectable()
export class QuizService {
  constructor(
    private readonly em: EntityManager,
    private readonly jwtService: JwtService,
    private readonly appConfigService: AppConfigService,
    @InjectPinoLogger('QuizService')
    private readonly logger: PinoLogger,
    private readonly axiosRetry: AxiosRetryService,
  ) {}

  async updateQuiz(maybeQuiz: number | QuizAttempt, updateQuizDto: UpdateQuizDto) {
    const quiz = typeof maybeQuiz == 'number' ? await this.em.findOneOrFail(QuizAttempt, { id: maybeQuiz }) : maybeQuiz;
    if (quiz.user) return {}; //already updated
    const existingUser = await this.findOrCreateUser(updateQuizDto.user);
    quiz.cmid = updateQuizDto.cmid;
    quiz.user = existingUser;
    quiz.path = updateQuizDto.path;
    await this.em.persistAndFlush(quiz);
    const token = this.jwtService.sign(
      { id: quiz.id, cmid: quiz.cmid, path: updateQuizDto.name },
      { secret: this.appConfigService.get<string>('jwt_secret'), expiresIn: '6h' },
    );
    return token;
  }
  async finishQuiz(id: string, finishQuizDto: FinishQuizDto) {
    const quiz = await this.em.findOne(QuizAttempt, { id: +id }, { populate: ['attemptAnswers'] });
    if (quiz.result) throw new HttpException('Тест уже завершен', HttpStatus.BAD_REQUEST);
    const answers = quiz.attemptAnswers.getItems();
    answers.forEach((answer) => {
      if (finishQuizDto.incorrectQuestions.find((item) => +item - 1 == answer.nativeId)) {
        answer.finalResult = QuestionResult.FAILED;
      } else {
        answer.finalResult = QuestionResult.SUCCESS;
      }
    });
    quiz.attemptStatus = AttemptStatus.FINISHED;
    quiz.result = new QuizResult(finishQuizDto.summaryData);
    await this.em.persistAndFlush(quiz);
    return new QuizResult(finishQuizDto.summaryData);
  }
  async createQuiz(createQuizDto: CreateQuizDto) {
    const code = await this.em.findOne(Code, { value: createQuizDto.code });
    if (code) {
      if (code.status !== CodeStatus.ACTIVE) {
        throw new HttpException('Код уже активирован', 400);
      } else {
        // const existingUser = await this.findOrCreateUser(createQuizDto.user);
        const newQuizAttempt = this.em.create(QuizAttempt, {
          code: code,
          // user: existingUser,
          // cmid: createQuizDto.cmid,
          // path: createQuizDto.path,
        });
        code.status = CodeStatus.USED;
        await this.em.persistAndFlush([newQuizAttempt, code]);
        await wrap(newQuizAttempt).init();
        const token = this.jwtService.sign(
          { id: newQuizAttempt.id },
          { secret: this.appConfigService.get<string>('jwt_secret'), expiresIn: '6h' },
        );
        return { token };
      }
    } else {
      throw new HttpException('Неверный код', 404);
    }
  }
  async findOrCreateUser(user: CreateQuizDtoUser) {
    if (!user) return null;
    const existingUser = await this.em.findOne(User, { userId: user.id });
    if (existingUser) {
      return existingUser;
    } else {
      const newUser = new User();
      newUser.name = user.name;
      newUser.userId = user.id;
      newUser.login = user.login;
      await this.em.persistAndFlush(newUser);
      return newUser;
    }
  }

  async getQuizAnswer(cookie: string, quizId: string, questionNativeId: string, quizAttemptId: string, updateQuizDto: UpdateQuizDto) {
    const quiz = await this.em.findOne(QuizAttempt, { id: +quizId }, { populate: ['attemptAnswers.answer'] });
    if (quiz.parsingState == AttemptParsingState.IN_PROGRESS) return { status: HttpStatus.BAD_REQUEST, error: 'PARSINGINPROGRESS' };
    if (!quiz.cmid || !quiz.user) {
      //update required, first call probably
      const token = await this.updateQuiz(+quizId, updateQuizDto);
      return { status: HttpStatus.ACCEPTED, token };
    }
    if (quiz.attemptAnswers.length == 0 || quiz.attemptAnswers.length !== quiz.questionAmount) {
      quiz.attemptId = quizAttemptId;
      try {
        await this.parseQuizData(cookie, quiz);
      } catch (error) {
        return { status: HttpStatus.BAD_REQUEST, error: 'PARSINGERROR' };
      }
    }
    if (quiz.attemptId != quizAttemptId) return { status: HttpStatus.BAD_REQUEST, error: 'IDMISMATCH' };

    const attemptAnswer = quiz.attemptAnswers.getItems().find((item) => item.nativeId == +questionNativeId);
    if (!attemptAnswer || !attemptAnswer.answer) return { status: HttpStatus.NOT_FOUND, error: 'DISASTER' };
    if (attemptAnswer.answer.jsonAnswer) {
      attemptAnswer.answered = true;
      const finished = quiz.attemptAnswers.getItems().every((item) => item.answered);
      const delay = (await this.em.findOne(Config, { name: 'QUESTION_TIME' })).value.split('-');
      finished && (quiz.attemptStatus = AttemptStatus.FINISHED);
      await this.em.persistAndFlush(quiz);
      return {
        delay: Math.floor(Math.random() * (+delay[1] - +delay[0]) + +delay[0]),
        answer: attemptAnswer.answer.jsonAnswer,
        type: attemptAnswer.answer.question_type,
      };
    } else {
      return { status: HttpStatus.NO_CONTENT, error: 'NOANSWER' };
    }
  }
  //https://campus.fa.ru/mod/quiz/view.php?id=483595
  async parseQuizData(cookie: string, quiz: QuizAttempt) {
    try {
      await this.switchQuizState(quiz, AttemptParsingState.IN_PROGRESS);
      /* 
    retries disabled , no sense coz extension will retry anyway
    in case of expires cookie we need to throw 
     */
      const quizPage = await this.axiosRetry.request(
        {
          method: 'GET',
          url: `https://campus.fa.ru/mod/quiz/attempt.php?attempt=${quiz.attemptId}&cmid=${quiz.cmid}`,
          headers: { Cookie: cookie },
        },
        0,
      );

      const dom = new JSDOM(quizPage.data);
      const questions = dom.window.document.querySelectorAll('.qn_buttons a');
      const existingItems = quiz.attemptAnswers.getItems();

      quiz.questionAmount = questions.length;
      quiz.attemptStatus = AttemptStatus.IN_PROGRESS;

      for (const question of questions) {
        const url = question.getAttribute('href');
        const nativeId = parseInt(url.split('page=').pop()) || 0;
        if (existingItems.find((item) => item.nativeId == nativeId)) continue;
        const page = url == '#' ? quizPage : await this.axiosRetry.request({ method: 'GET', url: url, headers: { Cookie: cookie } }, 0);
        const questionPage = new JSDOM(page.data);
        const questionData = HTMLCampusParser.get_question_type(questionPage.window.document as any);
        const form = questionPage.window.document.querySelector('.formulation.clearfix');
        let existingAnswer = await this.em.findOne(QuizAnswer, { question_hash: questionData.question_idhash });
        if (!existingAnswer || existingAnswer.question_type == -1) {
          await this.loadPictures(cookie, form);
          if (!existingAnswer) {
            existingAnswer = this.em.create(QuizAnswer, {
              question_hash: questionData.question_idhash,
              question_type: questionData.resultype,
              html: form.innerHTML,
            });
          } else if (existingAnswer.question_type == -1) {
            existingAnswer.question_type = questionData.resultype;
            existingAnswer.html = form.innerHTML;
          }
        }
        quiz.attemptAnswers.add(
          this.em.create(QuizAttemptAnswer, {
            attempt: quiz,
            answer: existingAnswer,
            nativeId,
          }),
        );
        await this.em.persistAndFlush(quiz);
      }
      quiz.parsingState = AttemptParsingState.FINISHED;
      await wrap(quiz).init();
    } catch (error) {
      await this.switchQuizState(quiz, AttemptParsingState.ABORTED);
      throw new Error('Parsing error');
    }
  }
  async switchQuizState(quiz: QuizAttempt, state: AttemptParsingState) {
    quiz.parsingState = state;
    await this.em.persistAndFlush(quiz);
  }
  async loadPictures(cookie: string, quizForm: Element) {
    const imgPaths = quizForm.querySelectorAll('img[src^="https://campus.fa.ru/pluginfile.php"');
    for (const img of imgPaths) {
      const imgPath = img.getAttribute('src');
      const paths = imgPath.split('/');
      const imgName = `${paths[paths.length - 2]}/${paths[paths.length - 1]}`;
      img.setAttribute('src', `/files/${imgName}`);
      if (!fs.existsSync(`./dist/public/files/${paths[paths.length - 2]}`)) {
        fs.mkdirSync(`./dist/public/files/${paths[paths.length - 2]}`, { recursive: true });
      }
      await this.axiosRetry
        .request({
          method: 'GET',
          url: imgPath,
          headers: { Cookie: cookie },
          responseType: 'stream',
        })
        .then((response) => {
          if (paths.length > 3) {
            response.data.pipe(fs.createWriteStream(`./dist/public/files/${imgName}`));
          }
        })
        .catch((err) => {
          throw new Error('Image loading error');
        });
    }
  }
}
