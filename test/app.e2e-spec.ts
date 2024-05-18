/* eslint "prettier/prettier": ['error', { printWidth: 250 }]*/
import './utils/matchers/toEqualExcept';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { MikroORM, wrap } from '@mikro-orm/core';
import { AppModule } from './app-test.module';
import { ClearDB } from './utils/helpers/db';
import jsonwebtoken from 'jsonwebtoken';
import { RetrieveAttemptDto } from 'src/modules/attempt/dto/retrieve-attempt.dto';
import { AttemptParsingState, AttemptStatus, QuizAttempt } from 'src/modules/mikroorm/entities/QuizAttempt';
import { questions } from './utils/helpers/questions';
import { QuizAttemptAnswer } from 'src/modules/mikroorm/entities/QuizAttemptAnswer';
import { initDB } from './utils/helpers/initDB';
import * as seeders from './utils/seeders';
import { getCampusCookie } from './utils/helpers/campusCookie';
describe('AppController (e2e)', () => {
  let app: INestApplication;
  let orm: MikroORM;
  let cookie: string;
  // await initDB();
  const attemptsKeys = ['id', 'attemptId', 'questionAmount', 'cmid', 'userId', 'userName', 'createdAt', 'status', 'answers', 'path'];
  const attemptAnswersKeys = ['id', 'html', 'jsonAnswer', 'nativeId', 'answered', 'result', 'question_type'];
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    orm = moduleFixture.get(MikroORM);

    cookie = await getCampusCookie();
    await initDB();
  }, 30000);

  beforeEach(async () => {
    // await ClearDB(orm);
  });

  afterAll(async () => {
    await orm.close(true);
    app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/').expect(404);
  });

  // const user = { id: 1, userId: '123', login: 'login', name: 'name' };
  const authHeader = `Bearer ${jsonwebtoken.sign({ id: '1' }, process.env.jwt_secret)}`;
  const chromeAuthHeader = `Bearer ${jsonwebtoken.sign({ id: '1', exp: 1000000000000000 }, process.env.jwt_secret)}`;

  describe('AnswersController', () => {
    let answers: any;
    beforeAll(async () => {
      await ClearDB(orm);
      answers = [
        { id: 1, html: '<html></html>', jsonAnswer: 'jsonAnswer', question_hash: 'question_hash', question_type: 1 },
        { id: 2, html: '<html></html>', jsonAnswer: 'jsonAnswer', question_hash: 'question_hash', question_type: 1 },
        { id: 3, html: '<html></html>', jsonAnswer: 'jsonAnswer', question_hash: 'question_hash', question_type: 1 },
        { id: 4, html: '<html></html>', jsonAnswer: 'jsonAnswer', question_hash: 'question_hash', question_type: 1 },
        { id: 5, html: '<html></html>', jsonAnswer: 'jsonAnswer', question_hash: 'question_hash', question_type: 1 },
      ];
      await orm.em.persistAndFlush(answers.map((answer: any) => orm.em.create('QuizAnswer', answer)));
    });
    //FIXME: need to get file sample somewhere
    // it('should create answer from ZIP', async () => {
    //   const response = await request(app.getHttpServer())
    //     .post('/answers')
    //     .set('Authorization', authHeader)
    //     .attach('file', 'test/files/answers.zip');
    //   expect(response.status).toBe(201);
    // });
    it('[GET answers] should reject unauthorized', async () => {
      const response = await request(app.getHttpServer()).get('/answers');
      const response2 = await request(app.getHttpServer()).put('/answers/1').send({ json: 'json' });
      const response3 = await request(app.getHttpServer()).post('/answers');
      const response4 = await request(app.getHttpServer()).post('/answers/lazy').send({ startRow: 0, endRow: 10 });
      expect(response.status).toBe(401);
      expect(response4.status).toBe(401);
      expect(response2.status).toBe(401);
      expect(response3.status).toBe(401);
    });
    it('[GET answers] should get all answers', async () => {
      const response = await request(app.getHttpServer()).get('/answers').set('Authorization', authHeader);
      expect(response.status).toBe(200);
      expect({ rows: answers, lastRow: 5 });
    });
    it('[PUT answers] should reject invalid JSON', async () => {
      const response = await request(app.getHttpServer()).put('/answers/1').set('Authorization', authHeader).send({ json: 'json' });
      expect(response.status).toBe(400);
    });
    it('[PUT answers] should update answer', async () => {
      const response = await request(app.getHttpServer()).put('/answers/1').set('Authorization', authHeader).send({ json: '{"test":2}' });
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: '1',
        html: '<html></html>',
        jsonAnswer: '{"test":2}',
        question_hash: 'question_hash',
        question_type: '1',
        createdAt: expect.any(String),
      });
    });
    it('[POST answers/lazy] should get answers', async () => {
      const response = await request(app.getHttpServer())
        .post('/answers/lazy')
        .set('Authorization', authHeader)
        .send({ startRow: 1, endRow: 3, sortModel: [{ colId: 'id', sort: 'desc' }] });
      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        rows: answers
          .slice(1, 3)
          .map((answer: any) => ({
            createdAt: expect.any(String),
            html: expect.any(String),
            id: expect.any(String),
            jsonAnswer: expect.any(String),
            question_hash: expect.any(String),
            question_type: answer.question_type.toString(),
          }))
          .sort((a: any, b: any) => b.id - a.id),
        lastRow: 5,
      });
    });
  });

  describe('AttemptController', () => {
    beforeAll(async () => {
      await ClearDB(orm);
      await seeders.users(orm);
      await seeders.codes(orm);
      await seeders.answers(orm);
      await seeders.attempts(orm);
      await seeders.attempt_answers(orm);
    });

    it('[] should reject unauthorized', async () => {
      const response = await request(app.getHttpServer()).get('/attempt');
      const response2 = await request(app.getHttpServer()).post('/attempt/lazy');
      const response3 = await request(app.getHttpServer()).put('/attempt/1');
      const response4 = await request(app.getHttpServer()).put('/attempt/answer/1');
      const response5 = await request(app.getHttpServer()).get('/attempt/pattern/1/ai');
      const response6 = await request(app.getHttpServer()).put('/attempt/pattern/1');
      expect(response.status).toBe(401);
      expect(response2.status).toBe(401);
      expect(response3.status).toBe(401);
      expect(response4.status).toBe(401);
      expect(response5.status).toBe(401);
      expect(response6.status).toBe(401);
    });

    it('[GET attempt] should get all attempts', async () => {
      const attempts = await orm.em.count('QuizAttempt', {});
      const response = await request(app.getHttpServer()).get('/attempt').set('Authorization', authHeader);
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(attempts);
      expect(Object.keys(response.body[0])).toEqual(attemptsKeys);
    });
    it('[POST attempt/lazy] should get attempts', async () => {
      const attempts = await orm.em.find(QuizAttempt, {});
      const ids = attempts.map((a) => +a.id).sort((a: any, b: any) => b.id - a.id);
      const response = await request(app.getHttpServer())
        .post('/attempt/lazy')
        .set('Authorization', authHeader)
        .send({ startRow: 0, endRow: 2, sortModel: [{ colId: 'id', sort: 'desc' }] });
      expect(response.status).toBe(201);
      expect(Object.keys(response.body)).toEqual(['rows', 'lastRow']);
      expect(response.body.rows.length).toBe(2);
      expect(response.body.rows[0].id).toEqual(ids[0]);
      expect(response.body.rows[1].id).toEqual(ids[1]);
      expect(Object.keys(response.body.rows[0])).toEqual(attemptsKeys);
    });
    it('[PUT attempt] should update attempt', async () => {
      const response = await request(app.getHttpServer()).put('/attempt/1').set('Authorization', authHeader).send({ status: 'in_progress' });
      const attempt = await orm.em.findOneOrFail(QuizAttempt, 1);
      expect(response.status).toBe(200);
      expect(response.body.status).toBe(AttemptStatus.IN_PROGRESS);
      expect(attempt.attemptStatus).toBe(AttemptStatus.IN_PROGRESS);
      expect(Object.keys(response.body)).toEqual(attemptsKeys);
    });
    it('[PUT attempt/answer] should update attempt answer', async () => {
      const response = await request(app.getHttpServer()).put('/attempt/answer/1').set('Authorization', authHeader).send({ answered: true });
      const attemptAnswer = await orm.em.findOneOrFail(QuizAttemptAnswer, 1);
      expect(response.status).toBe(200);
      expect(response.body.answered).toBe(true);
      expect(attemptAnswer.answered).toBe(true);
      expect(Object.keys(response.body)).toEqual(attemptAnswersKeys);
    });
    // it('[GET attempt/pattern/:id/ai] should get AI answer', async () => {
    //   const response = await request(app.getHttpServer()).get('/attempt/pattern/1/ai').set('Authorization', authHeader);
    //   expect(response.status).toBe(200);
    //   expect(response.body).toEqual(expect.any(String));
    // });
    it('[PUT attempt/pattern/:id] should update pattern', async () => {
      const response = await request(app.getHttpServer()).put('/attempt/pattern/1').set('Authorization', authHeader).send({ json: '{"test":2}' });
      const attemptAnswer = await orm.em.findOneOrFail(QuizAttemptAnswer, 1, { populate: ['answer'] });
      expect(response.status).toBe(200);
      expect(response.body.jsonAnswer).toBe('{"test":2}');
      expect(attemptAnswer.answer.jsonAnswer).toBe('{"test":2}');
      expect(Object.keys(response.body)).toEqual(attemptAnswersKeys);
    });
  });
  describe('QuizController', () => {
    const versionHeader = '0.0.1';

    beforeEach(async () => {
      await ClearDB(orm);
      await seeders.users(orm);
      await seeders.restrictions(orm);
      await seeders.codes(orm);
      await seeders.answers(orm);
      await seeders.attempts(orm);
      await seeders.attempt_answers(orm);
    });

    it('[] should reject unauthorized', async () => {
      const bannedUserHeader = `Bearer ${jsonwebtoken.sign({ id: '2', exp: 1000000000000000 }, process.env.jwt_secret)}`;
      const invalidVersionHeader = '0.0.0';
      const endpoints = [
        { path: '/quiz', method: 'get' },
        { path: '/quiz/new', method: 'post' },
        { path: '/quiz', method: 'put' },
        { path: '/quiz/finish', method: 'post' },
        { path: '/quiz/answer/1/attempt/1', method: 'post' },
      ];
      //no guards
      for (const endpoint of endpoints) {
        const response = await (request(app.getHttpServer()) as any)[endpoint.method](endpoint.path);
        expect(response.body.message).toEqual('No version');
        expect(response.status).toBe(401);
      }
      //invalid version guard
      for (const endpoint of endpoints) {
        const response = await (request(app.getHttpServer()) as any)[endpoint.method](endpoint.path).set('x-version', invalidVersionHeader);
        expect(response.body.message).toEqual('Version is outdated');
        expect(response.status).toBe(409);
      }
      //correct version guard
      const response = await request(app.getHttpServer()).get('/quiz').set('x-version', versionHeader);
      expect(response.status).toBe(200);
      const response2 = await request(app.getHttpServer()).post('/quiz/new').set('x-version', versionHeader);
      expect(response2.status).toBe(404);
      expect(response2.body.message).toEqual('Неверный код');
      //correct version, no jwt
      for (const endpoint of endpoints.slice(2)) {
        const response = await (request(app.getHttpServer()) as any)[endpoint.method](endpoint.path).set('x-version', versionHeader);
        expect(response.status).toBe(401);
        expect(response.body.message).toEqual('Unauthorized');
      }
      //correct version, correct jwt, user status banned
      for (const endpoint of endpoints.slice(2)) {
        const response = await (request(app.getHttpServer()) as any)[endpoint.method](endpoint.path).set('x-version', versionHeader).set('Authorization', bannedUserHeader);
        expect(response.status).toBe(401);
        expect(response.body.message).toEqual('User is restricted');
      }
    });

    describe('[POST quiz/new]', () => {
      it('Should reject wrong code', async () => {
        const response = await request(app.getHttpServer())
          .post('/quiz/new')
          .set('x-version', versionHeader)
          .send({ code: '1', cmid: '123', path: 'chunk1;chunk2', user: { id: '123', login: 'login', name: 'name' } });
        expect(response.status).toBe(404);
        expect(response.body.message).toEqual('Неверный код');
      });
      it('Should reject used code', async () => {
        const response = await request(app.getHttpServer())
          .post('/quiz/new')
          .set('x-version', versionHeader)
          .send({ code: 'F1D3D2EA1D1D2D3D', cmid: '123', path: 'chunk1;chunk2', user: { id: '123', login: 'login', name: 'name' } });
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual('Код уже активирован');
      });
      it('Should create quiz for user', async () => {
        const response = await request(app.getHttpServer()).post('/quiz/new').set('x-version', versionHeader).send({ code: 'F1D3D2EA1D1D2D3E' });
        const payload = jsonwebtoken.decode(response.body.token);
        const attempt = await orm.em.findOneOrFail(QuizAttempt, { code: { value: 'F1D3D2EA1D1D2D3E' } }, { populate: ['user', 'code'] });
        expect(response.status).toBe(201);
        expect(response.body.token).toEqual(expect.any(String));
        expect(payload).toEqual({ id: expect.any(Number), iat: expect.any(Number), exp: expect.any(Number) });
        expect(attempt).toMatchObject({
          cmid: null,
          path: null,
          user: null,
          code: { id: 5, value: 'F1D3D2EA1D1D2D3E', status: 'used' },
        });
      });
    });
    it('[GET healthcheck] Should return 200', async () => {
      const response = await request(app.getHttpServer()).get('/quiz/').set('x-version', versionHeader);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
    describe('[PUT quiz]', () => {
      it('Should return empty object', async () => {
        await orm.em.nativeUpdate(QuizAttempt, { id: 1 }, { user: orm.em.getReference('User', 1) });
        const response = await request(app.getHttpServer())
          .put('/quiz')
          .set('x-version', versionHeader)
          .set('Authorization', authHeader)
          .send({
            cmid: '123',
            path: 'chunk1;chunk2',
            user: { id: '123', login: 'login', name: 'name' },
          });
        expect(response.status).toBe(200);
        expect(response.body).toEqual({});
      });
      it('Should update quiz and create new user', async () => {
        await orm.em.nativeUpdate(QuizAttempt, { id: 1 }, { user: null });
        const response = await request(app.getHttpServer())
          .put('/quiz')
          .set('x-version', versionHeader)
          .set('Authorization', authHeader)
          .send({ cmid: '123', path: 'chunk1;chunk2', user: { id: '123', login: 'login', name: 'name' } });
        const attempt = await orm.em.findOneOrFail(QuizAttempt, 1, { populate: ['user'] });
        const payload = jsonwebtoken.decode(response.body.token);
        const user = await orm.em.findOneOrFail('User', { userId: '123' });
        expect(response.status).toBe(200);
        expect(response.body.token).toEqual(expect.any(String));
        expect(payload).toMatchObject({ id: 1, cmid: '123', path: 'chunk2' });
        expect(attempt).toMatchObject({
          id: 1,
          cmid: '123',
          path: 'chunk1;chunk2',
          user,
        });
      });
      it('Should update quiz and use existing user', async () => {
        await orm.em.nativeUpdate(QuizAttempt, { id: 1 }, { user: null });
        const response = await request(app.getHttpServer())
          .put('/quiz')
          .set('x-version', versionHeader)
          .set('Authorization', authHeader)
          .send({ cmid: '123', path: 'chunk1;chunk2', user: { id: '32838' } });
        const attempt = await orm.em.findOneOrFail(QuizAttempt, 1, { populate: ['user'] });
        const payload = jsonwebtoken.decode(response.body.token);
        const user = await orm.em.findOneOrFail('User', { userId: '32838' });
        expect(response.status).toBe(200);
        expect(response.body.token).toEqual(expect.any(String));
        expect(payload).toMatchObject({ id: 1, cmid: '123', path: 'chunk2' });
        expect(attempt).toMatchObject({
          id: 1,
          cmid: '123',
          path: 'chunk1;chunk2',
          user,
        });
      });
    });
    describe('[POST quiz/finish]', () => {
      it('Should reject already finished', async () => {
        await orm.em.persistAndFlush(orm.em.create('QuizResult', { attempt: orm.em.getReference('QuizAttempt', 1) }));
        const response = await request(app.getHttpServer())
          .post('/quiz/finish')
          .set('x-version', versionHeader)
          .set('Authorization', authHeader)
          .send({ incorrectQuestions: ['1', '2', '3'], summaryData: 'summaryData' });
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual('Тест уже завершен');
      });
      it('Should finish quiz', async () => {
        const response = await request(app.getHttpServer())
          .post('/quiz/finish')
          .set('x-version', versionHeader)
          .set('Authorization', authHeader)
          .send({
            incorrectQuestions: ['1', '2', '3'],
            summaryData: {
              'Тест начат': '1',
              Завершен: '2',
              Состояние: '3',
              'Прошло времени': '4',
              Баллы: '5',
              Оценка: '6',
              Отзыв: '7',
            },
          });
        const attempt = await orm.em.findOneOrFail(QuizAttempt, 1, { populate: ['result', 'attemptAnswers'] });
        expect(response.status).toBe(201);
        expect(attempt.result).toMatchObject({ startedAt: '1', finishedAt: '2', status: '3', timeElapsed: '4', points: '5', mark: '6', feedback: '7' });
        expect(response.body).toMatchObject({ startedAt: '1', finishedAt: '2', status: '3', timeElapsed: '4', points: '5', mark: '6', feedback: '7' });
        expect(
          attempt.attemptAnswers
            .getItems()
            .filter((answer) => answer.finalResult === 'failed')
            .map((answer) => answer.nativeId),
        ).toEqual([0, 1, 2]);
        expect(
          attempt.attemptAnswers
            .getItems()
            .filter((answer) => answer.finalResult === 'success')
            .map((answer) => answer.nativeId),
        ).toEqual([3]);
      });
    });
    describe('[POST answer/:page/attempt/:attempt]', () => {
      it('Should reject no cookie', async () => {
        const response = await request(app.getHttpServer()).post('/quiz/answer/1/attempt/1').set('x-version', versionHeader).set('Authorization', authHeader).send({ answer: 'answer' });
        expect(response.status).toBe(401);
        expect(response.body.message).toEqual('No session cookie');
      });
      //https://campus.fa.ru/mod/quiz/view.php?id=186319
      it('Should return not initiated, after quiz creation', async () => {
        const response = await request(app.getHttpServer()).post('/quiz/new').set('x-version', versionHeader).send({ code: 'F1D3D2EA1D1D2D3E' });
        const response2 = await request(app.getHttpServer()).post('/quiz/answer/1/attempt/1').set('x-version', versionHeader).set('Authorization', `Bearer ${response.body.token}`).set('Session', 'session');
        expect(response2.status).toBe(201);
        expect(response2.body).toMatchObject({ status: 400, error: 'NOTINITIATED' });
      });
      it(
        'Should parse questions for initiated test',
        async () => {
          const response = await request(app.getHttpServer())
            .post('/quiz/answer/0/attempt/1050855')
            .set('x-version', versionHeader)
            .set('Authorization', `Bearer ${jsonwebtoken.sign({ id: 4 }, process.env.jwt_secret)}`)
            .set('Session', cookie);
          const attempt = await orm.em.findOneOrFail(QuizAttempt, { cmid: '186319' }, { populate: ['attemptAnswers'] });
          const answers = attempt.attemptAnswers.getItems();
          expect(response.status).toBe(201);
          expect(response.body).toMatchObject({ status: 204, error: 'NOANSWER' });
          expect(answers.length).toBe(13);
          expect(answers.map((answer) => answer.nativeId)).toEqual(Array.from({ length: 13 }, (_, i) => i));
          expect(attempt.parsingState).toBe(AttemptParsingState.FINISHED);
        },
        500 * 1000,
      );
      it(
        'Should return parsing in progress',
        async () => {
          const response = (await Promise.race([
            new Promise((r) => {
              request(app.getHttpServer())
                .post('/quiz/answer/0/attempt/1050855')
                .set('x-version', versionHeader)
                .set('Authorization', `Bearer ${jsonwebtoken.sign({ id: 4 }, process.env.jwt_secret)}`)
                .set('Session', cookie)
                .then(r);
            }),
            new Promise((r) => {
              setTimeout(() => {
                request(app.getHttpServer())
                  .post('/quiz/answer/0/attempt/1050855')
                  .set('x-version', versionHeader)
                  .set('Authorization', `Bearer ${jsonwebtoken.sign({ id: 4 }, process.env.jwt_secret)}`)
                  .set('Session', cookie)
                  .then(r);
              }, 1000);
            }),
          ])) as Response;
          expect(response.status).toBe(201);
          expect(response.body).toMatchObject({ status: 400, error: 'PARSINGINPROGRESS' });
        },
        500 * 1000,
      );
      it('Should return answer for existing question', async () => {
        const attempt = await orm.em.findOneOrFail(QuizAttempt, 4, { populate: ['attemptAnswers.answer'] });
        attempt.attemptAnswers.add(orm.em.create('QuizAttemptAnswer', { nativeId: 0, answer: orm.em.getReference('QuizAnswer', 1) }));
        attempt.questionAmount = 1;
        attempt.attemptId = '1050855';
        await orm.em.persistAndFlush(attempt);
        const response = await request(app.getHttpServer())
          .post('/quiz/answer/0/attempt/1050855')
          .set('x-version', versionHeader)
          .set('Authorization', `Bearer ${jsonwebtoken.sign({ id: 4 }, process.env.jwt_secret)}`)
          .set('Session', cookie);
        const attemptanswer = await orm.em.findOneOrFail(QuizAttemptAnswer, { attempt: { id: 4 }, nativeId: 0 }, { populate: ['answer'] });
        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({ delay: expect.any(Number), answer: expect.any(String), type: expect.any(Number) });
        expect(attemptanswer.answered).toBe(true);
      });
    });
  });
});
