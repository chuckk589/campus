import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { MikroORM } from '@mikro-orm/core';
import { AppModule } from './app-test.module';
import { ClearDB } from './utils/helpers/db';
import { initDB } from './utils/helpers/preInitDB';
import jsonwebtoken from 'jsonwebtoken';
describe('AppController (e2e)', () => {
  let app: INestApplication;
  let orm: MikroORM;

  // await initDB();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    orm = moduleFixture.get(MikroORM);
  });

  beforeEach(async () => {
    await ClearDB(orm);
  });

  afterAll(async () => {
    await orm.close(true);
    app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/').expect(404);
  });
  const user = { userId: '123', login: 'login', name: 'name' };
  const authHeader = `Bearer ${jsonwebtoken.sign({ userId: '123', username: 'name' }, process.env.jwt_secret)}`;

  describe('AnswersController', () => {
    let answers: any;
    beforeAll(async () => {
      answers = [
        { id: 1, html: '<html></html>', jsonAnswer: 'jsonAnswer', question_hash: 'question_hash', question_type: 1 },
        { id: 2, html: '<html></html>', jsonAnswer: 'jsonAnswer', question_hash: 'question_hash', question_type: 1 },
        { id: 3, html: '<html></html>', jsonAnswer: 'jsonAnswer', question_hash: 'question_hash', question_type: 1 },
        { id: 4, html: '<html></html>', jsonAnswer: 'jsonAnswer', question_hash: 'question_hash', question_type: 1 },
        { id: 5, html: '<html></html>', jsonAnswer: 'jsonAnswer', question_hash: 'question_hash', question_type: 1 },
      ];
      await orm.em.persistAndFlush(answers.map((answer: any) => orm.em.create('QuizAnswer', answer)));
    });

    it('[POST answers] should reject unauthorized', async () => {
      const response = await request(app.getHttpServer()).post('/answers');
      expect(response.status).toBe(401);
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
      expect(response.status).toBe(401);
    });
    it('[GET answers] should get all answers', async () => {
      const response = await request(app.getHttpServer()).set('Authorization', authHeader).get('/answers');
      expect(response.status).toBe(200);
      expect({ rows: answers, lastRow: 5 });
    });
    it('[PUT answers] should reject unauthorized', async () => {
      const response = await request(app.getHttpServer()).put('/answers/1').send({ json: 'json' });
      expect(response.status).toBe(401);
    });
    it('[PUT answers] should reject invalid JSON', async () => {
      const response = await request(app.getHttpServer()).put('/answers/1').set('Authorization', authHeader).send({ json: 'json' });
      expect(response.status).toBe(400);
    });
    it('[PUT answers] should update answer', async () => {
      const response = await request(app.getHttpServer()).put('/answers/1').set('Authorization', authHeader).send({ json: '{"test":2}' });
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: 1,
        html: '<html></html>',
        jsonAnswer: '{"test":2}',
        question_hash: 'question_hash',
        question_type: 1,
        createdAt: expect.any(Date),
      });
    });

    it('[POST answers/lazy] should reject unauthorized', async () => {
      const response = await request(app.getHttpServer()).post('/answers/lazy').send({ startRow: 0, endRow: 10 });
      expect(response.status).toBe(401);
    });

    it('[POST answers/lazy] should get lazy answers', async () => {
      const response = await request(app.getHttpServer())
        .post('/answers/lazy')
        .set('Authorization', authHeader)
        .send({ startRow: 1, endRow: 3, sortModel: [{ colId: 'id', sort: 'desc' }] });
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        rows: answers.slice(1, 3).map((answer: any) => ({ ...answer, createdAt: expect.any(Date) }.sort((a: any, b: any) => b.id - a.id))),
        lastRow: 5,
      });
    });
  });

  describe('AttemptController', () => {
    beforeAll(async () => {
      const attempts = [
        { id: 1, attemptStatus: 1, user: { id: 1 } },
        { id: 2, attemptStatus: 1, user: { id: 1 } },
        { id: 3, attemptStatus: 1, user: { id: 1 } },
        { id: 4, attemptStatus: 1, user: { id: 1 } },
        { id: 5, attemptStatus: 1, user: { id: 1 } },
      ];
      await orm.em.persistAndFlush(attempts.map((attempt: any) => orm.em.create('QuizAttempt', attempt)));
    });
  });
});
