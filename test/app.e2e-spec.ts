/* eslint "prettier/prettier": ['error', { printWidth: 250 }]*/
import './utils/matchers/toEqualExcept';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { MikroORM } from '@mikro-orm/core';
import { AppModule } from './app-test.module';
import { initDB } from './utils/helpers/initDB';
import { loadExisting } from './utils/helpers/campusCookie';
import session from 'express-session';
import IORedis from 'ioredis';
import passport from 'passport';
import { REDIS } from 'src/constants';
import { QuizAttemptAnswer } from 'src/modules/mikroorm/entities/QuizAttemptAnswer';
import RedisStore from 'connect-redis';
import { ReqUser } from 'src/types/interfaces';
import jsonwebtoken from 'jsonwebtoken';
import { QuizAttempt } from 'src/modules/mikroorm/entities/QuizAttempt';
enum users {
  admin = 'admin',
  test = 'test',
  user = 'user',
}
describe('AppController (e2e)', () => {
  let app: INestApplication;
  let orm: MikroORM;
  let cookie: string;
  let redis: IORedis;
  let users: { [key in users]: { token: string; cookie: string } } = {} as any;
  let store: RedisStore;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    store = app.get('REDIS_STORE');
    app.use(
      session({
        store,
        secret: process.env.EXPRESS_SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
      }),
    );
    app.use(passport.initialize());
    app.use(passport.session());

    await app.init();
    orm = moduleFixture.get(MikroORM);
    redis = moduleFixture.get(REDIS);
    cookie = await loadExisting();

    await initDB();

    users = await loginUsers(app);
  }, 30000);

  // beforeEach(async () => {
  //   await ClearDB(orm);
  //   console.log('cleared');
  // });

  afterAll(async () => {
    await orm.close(true);
    await redis.quit();
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/').expect(404);
  });

  describe('AnswersController', () => {
    //FIXME: need to get file sample somewhere
    // it('should create answer from ZIP', async () => {
    //   const response = await request(app.getHttpServer())
    //     .post('/answers')
    //     .set('Authorization', users.admin.token)
    //     .attach('file', 'test/files/answers.zip');
    //   expect(response.status).toBe(201);
    // });
    it('[GET answers] should reject unauthorized', async () => {
      const response = await request(app.getHttpServer()).get('/answers');
      const response2 = await request(app.getHttpServer()).put('/answers/1');
      const response3 = await request(app.getHttpServer()).post('/answers');
      const response4 = await request(app.getHttpServer()).post('/answers/load');
      expect(response.status).toBe(403);
      expect(response4.status).toBe(403);
      expect(response2.status).toBe(403);
      expect(response3.status).toBe(403);
    });
    it('[GET answers] should get all answers', async () => {
      const response = await request(app.getHttpServer()).get('/answers').set('Authorization', users.admin.token).set('Cookie', users.admin.cookie);
      expect(response.status).toBe(200);
      expect(response.body[0]).toBeInstanceOf(Object);
    });
    it('[PUT answers] should reject invalid JSON', async () => {
      const response = await request(app.getHttpServer()).put('/answers/1').set('Authorization', users.admin.token).set('Cookie', users.admin.cookie).send({ json: 'json' });
      expect(response.status).toBe(400);
    });
    it('[PUT answers] should update answer', async () => {
      const response = await request(app.getHttpServer()).put('/answers/1145').set('Authorization', users.admin.token).set('Cookie', users.admin.cookie).send({ json: '{"test":2}' });
      const answer: any = await orm.em.findOneOrFail('QuizAnswer', 1145);
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.jsonAnswer).toBe('{"test":2}');
      expect(answer.jsonAnswer).toBe('{"test":2}');
    });
    it('[POST answers/load] should get answers', async () => {
      const response = await request(app.getHttpServer())
        .post('/answers/load')
        .set('Authorization', users.admin.token)
        .set('Cookie', users.admin.cookie)
        .send({ startRow: 1, endRow: 3, sortModel: [{ colId: 'id', sort: 'desc' }] });
      expect(response.status).toBe(201);
      expect(Object.keys(response.body)).toEqual(['rows', 'lastRow']);
      expect(response.body.rows.length).toBe(2);
      expect(response.body.rows[0].id >= response.body.rows[1].id).toBe(true);
    });
  });

  describe('AttemptController', () => {
    it('[] should reject unauthorized', async () => {
      const response = await request(app.getHttpServer()).post('/attempt/load');
      const response2 = await request(app.getHttpServer()).put('/attempt/1');
      const response3 = await request(app.getHttpServer()).get('/attempt/pattern/1/ai');
      const response4 = await request(app.getHttpServer()).put('/attempt/pattern/1');
      expect(response.status).toBe(403);
      expect(response2.status).toBe(403);
      expect(response3.status).toBe(403);
      expect(response4.status).toBe(403);
    });

    it('[POST attempt/lazy] should get attempts', async () => {
      const response = await request(app.getHttpServer())
        .post('/attempt/load')
        .set('Authorization', users.admin.token)
        .set('Cookie', users.admin.cookie)
        .send({ startRow: 1, endRow: 3, sortModel: [{ colId: 'attemptId', sort: 'desc' }], filterModel: [] });
      expect(response.status).toBe(201);
      expect(Object.keys(response.body)).toEqual(['rows']);
      expect(response.body.rows[0].attemptId >= response.body.rows[1].attemptId).toBe(true);
      expect(response.body.rows.length).toBe(2);
    });
    it('[PUT attempt] should update attempt', async () => {
      const response = await request(app.getHttpServer()).put('/attempt/44').set('Authorization', users.admin.token).set('Cookie', users.admin.cookie).send({ status: 'in_progress', editable: true });
      const attempt: any = await orm.em.findOneOrFail('QuizAttempt', 44);
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({ status: 'in_progress', editable: true });
      expect(attempt).toMatchObject({ attemptStatus: 'in_progress', editable: true });
    });
    it('[PUT attempt/pattern/:id] should update pattern', async () => {
      const response = await request(app.getHttpServer()).put('/attempt/pattern/1451').set('Authorization', users.admin.token).set('Cookie', users.admin.cookie).send({ json: '{"test":2}' });
      const attemptAnswer = await orm.em.findOneOrFail(QuizAttemptAnswer, 1451, { populate: ['answer'] });
      expect(response.status).toBe(200);
      expect(response.body.jsonAnswer).toBe('{"test":2}');
      expect(attemptAnswer.answer.jsonAnswer).toBe('{"test":2}');
    });
    it('[PUT attempt/pattern/:id] should reject for non admin user', async () => {
      const response = await request(app.getHttpServer()).put('/attempt/pattern/1451').set('Authorization', users.test.token).set('Cookie', users.test.cookie).send({ json: '{"test":2}' });
      expect(response.status).toBe(405);
      expect(response.body.message).toBe('Insufficient permissions');
    });
    it('[PUT attempt/pattern/:id] should update pattern for non admin', async () => {
      const response = await request(app.getHttpServer()).put('/attempt/pattern/1380').set('Authorization', users.user.token).set('Cookie', users.user.cookie).send({ json: '{"test":2}' });
      const attemptAnswer = await orm.em.findOneOrFail(QuizAttemptAnswer, 1380, { populate: ['answer'] });
      expect(response.status).toBe(200);
      expect(response.body.jsonAnswer).toBe('{"test":2}');
      expect(attemptAnswer.answer.jsonAnswer).toBe('{"test":2}');
    });
  });

  describe('CodeController', () => {
    beforeEach(async () => {
      await initDB(orm);
    });
    it('[] should reject unauthorized', async () => {
      const response = await request(app.getHttpServer()).post('/code');
      const response2 = await request(app.getHttpServer()).get('/code');
      const response3 = await request(app.getHttpServer()).put('/code/1');
      const response4 = await request(app.getHttpServer()).delete('/code?ids=1');
      expect(response.status).toBe(403);
      expect(response2.status).toBe(403);
      expect(response3.status).toBe(403);
      expect(response4.status).toBe(403);
    });

    it('[POST code] should create codes', async () => {
      const response = await request(app.getHttpServer()).post('/code').set('Authorization', users.admin.token).set('Cookie', users.admin.cookie).send({ amount: 100 });
      expect(response.status).toBe(201);
      expect(response.body[0]).toBeInstanceOf(Object);
      expect(response.body.length).toBe(30);
    });
    it('[GET code] should get all codes for admin', async () => {
      const response = await request(app.getHttpServer()).get('/code').set('Authorization', users.admin.token).set('Cookie', users.admin.cookie);
      expect(response.status).toBe(200);
      expect(response.body[0]).toBeInstanceOf(Object);
    });
    it('[GET code] should return codes related to user', async () => {
      const response = await request(app.getHttpServer()).get('/code').set('Authorization', users.user.token).set('Cookie', users.user.cookie);
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0]).toBeInstanceOf(Object);
    });

    it('[PUT code] should update code', async () => {
      const response = await request(app.getHttpServer()).put('/code/100').set('Authorization', users.admin.token).set('Cookie', users.admin.cookie).send({ status: 'used' });
      const code: any = await orm.em.findOneOrFail('Code', 100);
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({ status: 'used' });
      expect(code.status).toBe('used');
    });

    it('[DELETE code] should delete codes', async () => {
      const response = await request(app.getHttpServer()).delete('/code?ids=103,107').set('Authorization', users.admin.token).set('Cookie', users.admin.cookie);
      const response2 = await request(app.getHttpServer()).delete('/code?ids=108,109').set('Authorization', users.admin.token).set('Cookie', users.admin.cookie);
      const codes = await orm.em.find('Code', { id: { $in: [108, 109, 103, 107] } });
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
      expect(response2.status).toBe(200);
      expect(codes.length).toBe(2);
      expect(response2.body).toEqual([108, 109]);
    });
  });
  describe('OwnerController', () => {
    beforeEach(async () => {
      await initDB(orm);
      await store.clear();
      users = await loginUsers(app);
    });
    it('[] should reject unauthorized', async () => {
      const response = await request(app.getHttpServer()).post('/owner');
      const response2 = await request(app.getHttpServer()).get('/owner');
      const response3 = await request(app.getHttpServer()).put('/owner/1');
      const response4 = await request(app.getHttpServer()).delete('/owner?ids=1');
      const response5 = await request(app.getHttpServer()).post('/owner').set('Authorization', users.user.token).set('Cookie', users.user.cookie);
      const response6 = await request(app.getHttpServer()).get('/owner').set('Authorization', users.user.token).set('Cookie', users.user.cookie);
      const response7 = await request(app.getHttpServer()).put('/owner/1').set('Authorization', users.user.token).set('Cookie', users.user.cookie);
      const response8 = await request(app.getHttpServer()).delete('/owner?ids=1').set('Authorization', users.user.token).set('Cookie', users.user.cookie);

      expect(response.status).toBe(403);
      expect(response2.status).toBe(403);
      expect(response3.status).toBe(403);
      expect(response4.status).toBe(403);
      expect(response5.status).toBe(403);
      expect(response6.status).toBe(403);
      expect(response7.status).toBe(403);
      expect(response8.status).toBe(403);
    });
    it('[POST owner] should create owner', async () => {
      const response = await request(app.getHttpServer()).post('/owner').set('Authorization', users.admin.token).set('Cookie', users.admin.cookie).send({ username: 'login', password: 'password', role: 'admin' });
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({ username: 'login', role: 'admin' });
    });
    it('[GET owner] should get all owners', async () => {
      const response = await request(app.getHttpServer()).get('/owner').set('Authorization', users.admin.token).set('Cookie', users.admin.cookie);
      expect(response.status).toBe(200);
      expect(response.body[0]).toBeInstanceOf(Object);
    });
    it('[PUT owner] should update owner and logout', async () => {
      const response = await request(app.getHttpServer())
        .put('/owner/1')
        .set('Authorization', users.admin.token)
        .set('Cookie', users.admin.cookie)
        .send({ credentials: 'credentials', email: 'email', password: 'password', permissions: ['10'], role: 'admin' });
      const response2 = await request(app.getHttpServer()).put('/owner/1').set('Authorization', users.admin.token);
      const owner: any = await orm.em.findOneOrFail('Owner', 1);
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({ credentials: 'credentials', email: 'email', role: 'admin' });
      expect(owner).toMatchObject({ credentials: 'credentials', email: 'email', role: 'admin' });
      expect(response.body.permissions[0].id).toEqual(expect.any(String));
      expect(response2.status).toBe(403);
    });
    it('[DELETE owner] should delete owner and logout', async () => {
      const response = await request(app.getHttpServer()).delete('/owner?ids=1').set('Authorization', users.admin.token).set('Cookie', users.admin.cookie);
      const owners = await orm.em.find('Owner', { id: 1 });
      const user = await findUserSession(store, 1);
      expect(response.status).toBe(200);
      expect(response.body).toEqual([1]);
      expect(owners.length).toBe(0);
      expect(user).toBeUndefined();
    });
  });

  describe('QuizController', () => {
    const versionHeader = '12.433.2';
    const bannedUserHeader = `Bearer ${jsonwebtoken.sign({ attemptId: '50', exp: 1000000000000000 }, process.env.jwt_secret)}`;
    const completedTestHeader = `Bearer ${jsonwebtoken.sign({ attemptId: '56', exp: 1000000000000000 }, process.env.jwt_secret)}`;
    const inProgressTestHeader = `Bearer ${jsonwebtoken.sign({ attemptId: '44', exp: 1000000000000000 }, process.env.jwt_secret)}`;
    const invalidVersionHeader = '0.0.0';
    beforeAll(async () => {
      await initDB(orm);
    });

    it('[] should reject unauthorized', async () => {
      const endpoints = [
        { path: '/quiz', method: 'get' },
        { path: '/quiz/new', method: 'post' },
        // { path: '/quiz', method: 'put' },
        { path: '/quiz/finish', method: 'post' },
        { path: '/quiz/answer/1', method: 'post' },
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
        const response = await request(app.getHttpServer()).post('/quiz/new').set('x-version', versionHeader).send({ code: 'A7529CA5EA0643B6' });
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual('Код уже активирован');
      });
      it('Should create quiz for user', async () => {
        const response = await request(app.getHttpServer()).post('/quiz/new').set('x-version', versionHeader).send({ code: 'A7529CA5EA043B622' });
        const payload = jsonwebtoken.decode(response.body.token);
        const attempt = await orm.em.findOne('QuizAttempt', { code: { value: 'A7529CA5EA043B622' } }, { populate: ['user', 'code'] });
        expect(response.status).toBe(201);
        expect(response.body.token).toEqual(expect.any(String));
        expect(payload).toEqual({ attemptId: expect.any(Number), iat: expect.any(Number), exp: expect.any(Number) });
        expect(attempt).toMatchObject({
          cmid: null,
          path: null,
          user: null,
          code: { value: 'A7529CA5EA043B622', status: 'used' },
        });
      });
    });
    it('[GET healthcheck] Should return 200', async () => {
      const response = await request(app.getHttpServer()).get('/quiz/').set('x-version', versionHeader);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
    describe('[POST quiz/finish]', () => {
      it('Should reject already finished', async () => {
        const response = await request(app.getHttpServer()).post('/quiz/finish').set('x-version', versionHeader).set('Authorization', completedTestHeader);
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual('Тест уже завершен');
      });
      it('Should finish quiz', async () => {
        const response = await request(app.getHttpServer())
          .post('/quiz/finish')
          .set('x-version', versionHeader)
          .set('Authorization', inProgressTestHeader)
          .send({
            questions: [
              {
                value: '0',
                state: 'correct',
              },
              {
                value: '1',
                state: 'incorrect',
              },
            ],
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
        const attempt = await orm.em.findOne(QuizAttempt, { id: 44 }, { populate: ['result', 'attemptAnswers.answer.quizStates'] });
        const correct = attempt.attemptAnswers.find((answer) => answer.nativeId == 0);
        const incorrect = attempt.attemptAnswers.find((answer) => answer.nativeId == 1);
        expect(response.status).toBe(201);
        expect(attempt.result).toMatchObject({ startedAt: '1', finishedAt: '2', status: '3', timeElapsed: '4', points: '5', mark: '6', feedback: '7' });
        expect(response.body).toMatchObject({ startedAt: '1', finishedAt: '2', status: '3', timeElapsed: '4', points: '5', mark: '6', feedback: '7' });
        expect(correct.answer).toMatchObject({ state: 'correct' });
        expect(incorrect.answer).toMatchObject({ state: 'incorrect' });
        expect(correct.answer.quizStates.length).toBe(0);
        expect(incorrect.answer.quizStates.length).toBe(1);
      });
    });
    describe('[POST answer/:page/]', () => {
      it('Should reject no cookie', async () => {
        const response = await request(app.getHttpServer()).post('/quiz/answer/1/').set('x-version', versionHeader).set('Authorization', inProgressTestHeader).send({ answer: 'answer' });
        expect(response.status).toBe(401);
        expect(response.body.message).toEqual('No session cookie');
      });

      it('Should update quiz and create user', async () => {
        const response = await request(app.getHttpServer()).post('/quiz/new').set('x-version', versionHeader).send({ code: 'A7529CA5EA043B6' });
        const payload: { attemptId: number } = jsonwebtoken.decode(response.body.token) as any;
        const response2 = await request(app.getHttpServer())
          .post(`/quiz/answer/1`)
          .set('x-version', versionHeader)
          .set('Authorization', `Bearer ${response.body.token}`)
          .set('Session', cookie)
          .send({
            cmid: '1',
            path: 'chunk1;chunk2',
            name: 'name',
            user: { id: '123', login: 'login', name: 'name' },
            attempt: '444',
          });
        const attempt = await orm.em.findOneOrFail(QuizAttempt, payload.attemptId, { populate: ['user'] });
        const payload2 = jsonwebtoken.decode(response2.body.token);
        const user = await orm.em.findOneOrFail('User', { userId: '123' });
        expect(response2.body.status).toBe(202);
        expect(response2.body.token).toEqual(expect.any(String));
        expect(payload2).toMatchObject({ attemptId: expect.any(Number), cmid: '1', path: 'name' });
        expect(attempt).toMatchObject({ cmid: '1', path: 'chunk1;chunk2;name', user, attemptId: '444' });
        expect(user).toMatchObject({ id: expect.any(Number), userId: '123', login: 'login', name: 'name' });
      });
      it(
        'Should parse questions for test',
        async () => {
          //https://campus.fa.ru/mod/quiz/view.php?id=186319 start a new attempt here if its closed or smth
          await orm.em.persistAndFlush(orm.em.create(QuizAttempt, { user: orm.em.getReference('User', 25), cmid: '186319', attemptId: '1619922', id: 100, code: { value: 'any' } }));
          const response = await request(app.getHttpServer())
            .post('/quiz/answer/0/')
            .set('x-version', versionHeader)
            .set('Authorization', `Bearer ${jsonwebtoken.sign({ attemptId: 100 }, process.env.jwt_secret)}`)
            .set('Session', cookie)
            .send({ attempt: '1619922' });
          const attempt = await orm.em.findOneOrFail(QuizAttempt, { id: 100 }, { populate: ['attemptAnswers'], refresh: true });
          const answers = attempt.attemptAnswers.getItems();
          expect(response.status).toBe(201);
          expect(response.body).toMatchObject({ status: 204, error: 'NOANSWER' });
          expect(answers.length).toBe(13);
          expect(answers.map((answer) => answer.nativeId)).toEqual(Array.from({ length: 13 }, (_, i) => i));
          expect(attempt.parsingState).toBe('finished');
        },
        500 * 1000,
      );

      it('Should return answer for existing question', async () => {
        // const attempt = await orm.em.findOneOrFail(QuizAttempt, 50, { populate: ['attemptAnswers.answer'] });
        // attempt.attemptAnswers.add(orm.em.create(QuizAttemptAnswer, { nativeId: 0, answer: orm.em.getReference('QuizAnswer', 1) }));
        // attempt.questionAmount = 1;
        // attempt.attemptId = '1050855';
        // await orm.em.persistAndFlush(attempt);
        const response = await request(app.getHttpServer())
          .post('/quiz/answer/0/')
          .set('x-version', versionHeader)
          .set('Authorization', `Bearer ${jsonwebtoken.sign({ attemptId: 48 }, process.env.jwt_secret)}`)
          .set('Session', cookie)
          .send({ attempt: '1561127' });
        const attemptanswer = await orm.em.findOneOrFail(QuizAttemptAnswer, { attempt: { id: 48 }, nativeId: 0 }, { populate: ['answer'] });
        console.log(response.body);
        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({ delay: expect.any(Number), answer: expect.any(String), type: expect.any(Number) });
        expect(attemptanswer.answered).toBe(true);
      });
      it(
        'Should return parsing in progress',
        async () => {
          const unInitiatedTestHeader = `Bearer ${jsonwebtoken.sign({ attemptId: 60 }, process.env.jwt_secret)}`;
          const response = (await Promise.race([
            new Promise((r) => {
              request(app.getHttpServer()).post('/quiz/answer/0/').set('x-version', versionHeader).set('Authorization', unInitiatedTestHeader).set('Session', cookie).then(r);
            }),
            new Promise((r) => {
              setTimeout(() => {
                request(app.getHttpServer()).post('/quiz/answer/0/').set('x-version', versionHeader).set('Authorization', unInitiatedTestHeader).set('Session', cookie).then(r);
              }, 1000);
            }),
          ])) as Response;
          expect(response.status).toBe(201);
          expect(response.body).toMatchObject({ status: 400, error: 'PARSINGINPROGRESS' });
        },
        500 * 1000,
      );
    });
  });
});

async function getAuthCredentials(app: INestApplication, login = 'superadmin'): Promise<{ token: string; cookie: string }> {
  const response = await request(app.getHttpServer()).post('/auth/login').send({ username: login, password: '1' });
  const token = response.body.token;
  const cookie = response.header['set-cookie'][0];
  return { token: `Bearer ${token}`, cookie };
}
async function loginUsers(app: INestApplication) {
  return {
    admin: await getAuthCredentials(app, 'superadmin'),
    test: await getAuthCredentials(app, 'test'),
    user: await getAuthCredentials(app, 'miranslavaa1'),
  };
}

async function findUserSession(store: RedisStore, userId: number) {
  return new Promise((resolve) => {
    store.all((_, entries) => {
      resolve(entries.find((entry: { passport: { user: ReqUser } }) => entry.passport.user.id == userId));
    });
  });
}
