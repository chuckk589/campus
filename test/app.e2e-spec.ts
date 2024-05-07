import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { MikroORM } from '@mikro-orm/core';
import { AppModule } from './app-test.module';
import { ClearDB } from './utils/helpers/db';
import { initDB } from './utils/helpers/preInitDB';

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
    console.log('beforeEach');
    await ClearDB(orm);
  });

  afterAll(async () => {
    await orm.close(true);
    app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/').expect(404);
  });

  // describe('Answers', () => {
  //   describe('AnswersController', () => {
  //     it('should create answer', async () => {
  //       const response = await request(app.getHttpServer()).post('/answers');
  //       expect(response.status).toBe(201);
  //     });
  //   });
  // });
});
