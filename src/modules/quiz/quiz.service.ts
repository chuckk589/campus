import { wrap } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/mysql';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from '../app-config/app-config.service';
import { Code, CodeStatus } from '../mikroorm/entities/Code';
import { QuizAttempt } from '../mikroorm/entities/QuizAttempt';
import { User } from '../mikroorm/entities/User';
import { CreateQuizDto } from './dto/create-quiz.dto';
import axios from 'axios';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { QuizAttemptAnswer } from '../mikroorm/entities/QuizAttemptAnswer';
import { HTMLCampusParser } from 'src/types/interfaces';
import { JSDOM } from 'jsdom';
import { QuizAnswer } from '../mikroorm/entities/QuizAnswer';

@Injectable()
export class QuizService {
  constructor(
    private readonly em: EntityManager,
    private readonly jwtService: JwtService,
    private readonly appConfigService: AppConfigService,
    @InjectPinoLogger('QuizService')
    private readonly logger: PinoLogger,
  ) {}

  async createQuiz(createQuizDto: CreateQuizDto) {
    const code = await this.em.findOne(Code, { value: createQuizDto.code });
    if (code) {
      if (code.status !== CodeStatus.ACTIVE) {
        throw new HttpException('Code is not active', 400);
      } else {
        const existingUser = await this.findOrCreateUser(createQuizDto.user);
        const newQuizAttempt = this.em.create(QuizAttempt, {
          code: code,
          user: existingUser,
          cmid: createQuizDto.cmid,
          time: createQuizDto.time,
        });
        code.status = CodeStatus.USED;
        await this.em.persistAndFlush([newQuizAttempt, code]);
        await wrap(newQuizAttempt).init();
        const token = this.jwtService.sign(
          { id: newQuizAttempt.id, cmid: newQuizAttempt.cmid, time: newQuizAttempt.time },
          { expiresIn: '1h', secret: this.appConfigService.get<string>('jwt_secret') },
        );
        return { token };
      }
    } else {
      throw new HttpException('Code not found', 404);
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
    if (quiz.attemptAnswers.toArray().length == 0) {
      //initial call, need to parse quiz data
      quiz.attemptId = quizAttemptId;
      await this.parseQuizData(cookie, quiz);
    }
    const targetAnswer = quiz.attemptAnswers.toArray().find((item) => item.nativeId == +questionNativeId).answer;
    if (targetAnswer) {
      if (targetAnswer.jsonAnswer) {
        return {
          answer: targetAnswer.jsonAnswer,
          type: targetAnswer.question_type,
        };
      } else {
        return { status: HttpStatus.NO_CONTENT };
      }
    } else {
      return new HttpException('Answer not found', 404);
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
          nativeId: url == '#' ? 0 : +url.split('page=').pop()[0],
        }),
      );
      quiz.questionAmount = questions.length;
    }
    await wrap(quiz).init();
  }
}
