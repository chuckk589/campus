import { wrap } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/mysql';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from '../app-config/app-config.service';
import { Code, CodeStatus } from '../mikroorm/entities/Code';
import { AttemptStatus, QuizAttempt } from '../mikroorm/entities/QuizAttempt';
import { User } from '../mikroorm/entities/User';
import { CreateQuizDto } from './dto/create-quiz.dto';
import axios from 'axios';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { QuestionResult, QuizAttemptAnswer } from '../mikroorm/entities/QuizAttemptAnswer';
import { HTMLCampusParser } from 'src/types/interfaces';
import { JSDOM } from 'jsdom';
import { QuizAnswer } from '../mikroorm/entities/QuizAnswer';
import { Config } from '../mikroorm/entities/Config';
import { FinishQuizDto } from './dto/finish-quiz.dto';
import { QuizResult } from '../mikroorm/entities/QuizResult';

@Injectable()
export class QuizService {
  constructor(
    private readonly em: EntityManager,
    private readonly jwtService: JwtService,
    private readonly appConfigService: AppConfigService,
    @InjectPinoLogger('QuizService')
    private readonly logger: PinoLogger,
  ) {}
  async finishQuiz(id: string, finishQuizDto: FinishQuizDto) {
    const quiz = await this.em.findOne(QuizAttempt, { id: +id }, { populate: ['attemptAnswers'] });
    if (quiz.attemptStatus == AttemptStatus.FINISHED) throw new HttpException('Тест уже завершен', HttpStatus.BAD_REQUEST);
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
  }
  async createQuiz(createQuizDto: CreateQuizDto) {
    const code = await this.em.findOne(Code, { value: createQuizDto.code });
    if (code) {
      if (code.status !== CodeStatus.ACTIVE) {
        throw new HttpException('Код уже активирован', 400);
      } else {
        const existingUser = await this.findOrCreateUser(createQuizDto.user);
        const newQuizAttempt = this.em.create(QuizAttempt, {
          code: code,
          user: existingUser,
          cmid: createQuizDto.cmid,
        });
        code.status = CodeStatus.USED;
        await this.em.persistAndFlush([newQuizAttempt, code]);
        await wrap(newQuizAttempt).init();
        const token = this.jwtService.sign({ id: newQuizAttempt.id }, { secret: this.appConfigService.get<string>('jwt_secret') });
        return { token };
      }
    } else {
      throw new HttpException('Неверный код', 404);
    }
  }
  async findOrCreateUser(user: { name: string; id: string }) {
    const existingUser = await this.em.findOne(User, { userId: user.id });
    if (existingUser) {
      return existingUser;
    } else {
      const newUser = new User();
      newUser.name = user.name;
      newUser.userId = user.id;
      await this.em.persistAndFlush(newUser);
      return newUser;
    }
  }

  async getQuizAnswer(cookie: string, quizId: string, questionNativeId: string, quizAttemptId: string) {
    const quiz = await this.em.findOne(QuizAttempt, { id: +quizId }, { populate: ['attemptAnswers.answer'] });
    if (quiz.attemptAnswers.length == 0) {
      //initial call, need to parse quiz data
      quiz.attemptId = quizAttemptId;
      await this.parseQuizData(cookie, quiz);
    }
    if (quiz.attemptId != quizAttemptId) return { status: HttpStatus.BAD_REQUEST, error: 'IDMISMATCH' };

    const attemptAnswer = quiz.attemptAnswers.getItems().find((item) => item.nativeId == +questionNativeId);
    const progress = quiz.attemptAnswers
      .getItems()
      .sort((a, b) => a.nativeId - b.nativeId)
      .map((item) => item.answered);
    if (!attemptAnswer || !attemptAnswer.answer) return { status: HttpStatus.NOT_FOUND, error: 'DISASTER' };
    if (attemptAnswer.answered) return { status: HttpStatus.BAD_REQUEST, error: 'ANSWERED', progress: progress };
    if (attemptAnswer.answer.jsonAnswer) {
      attemptAnswer.answered = true;
      const delay = (await this.em.findOne(Config, { name: 'QUESTION_TIME' })).value.split('-');
      await this.em.persistAndFlush(quiz);
      return {
        delay: Math.floor(Math.random() * (+delay[1] - +delay[0]) + +delay[0]),
        answer: attemptAnswer.answer.jsonAnswer,
        type: attemptAnswer.answer.question_type,
        progress: progress,
      };
    } else {
      return { status: HttpStatus.NO_CONTENT, progress: progress, error: 'NOANSWER' };
    }
  }

  async parseQuizData(cookie: string, quiz: QuizAttempt) {
    const quizPage = await axios.get(`https://campus.fa.ru/mod/quiz/attempt.php?attempt=${quiz.attemptId}&cmid=${quiz.cmid}`, {
      headers: { Cookie: cookie },
    });
    const dom = new JSDOM(quizPage.data);
    const questions = dom.window.document.querySelectorAll('.qn_buttons a');
    for (const question of questions) {
      const url = question.getAttribute('href');
      const page = url == '#' ? quizPage : await axios.get(url, { headers: { Cookie: cookie } });
      const questionPage = new JSDOM(page.data);
      const questionData = HTMLCampusParser.get_question_type(questionPage.window.document as any);
      let existingAnswer = await this.em.findOne(QuizAnswer, { question_hash: questionData.question_idhash });
      if (!existingAnswer) {
        existingAnswer = this.em.create(QuizAnswer, {
          question_hash: questionData.question_idhash,
          question_type: questionData.resultype,
          html: questionPage.window.document.querySelector('.formulation.clearfix').innerHTML,
        });
      }
      quiz.attemptAnswers.add(
        this.em.create(QuizAttemptAnswer, {
          attempt: quiz,
          answer: existingAnswer,
          nativeId: url == '#' ? 0 : parseInt(url.split('page=').pop()),
        }),
      );
      quiz.questionAmount = questions.length;
      quiz.attemptStatus = AttemptStatus.IN_PROGRESS;
    }
    await wrap(quiz).init();
  }
}
