import { EntityManager } from '@mikro-orm/core';
import { QuizService } from './quiz.service';
import { TestBed } from '@automock/jest';
import { QuestionResult } from '../mikroorm/entities/QuizAttemptAnswer';
import { AttemptStatus } from '../mikroorm/entities/QuizResult';
import { CodeStatus } from '../mikroorm/entities/Code';

jest.mock('@mikro-orm/core', () => {
  const originalModule = jest.requireActual('@mikro-orm/core');
  return {
    __esModule: true,
    ...originalModule,
    wrap: () => ({ init: jest.fn() }),
  };
});

describe('QuizService', () => {
  let service: QuizService;

  let em: EntityManager;
  beforeAll(() => {
    const { unit, unitRef } = TestBed.create(QuizService).compile();

    service = unit;
    em = unitRef.get(EntityManager);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateQuiz', () => {
    it('should return empty object if quiz user is already updated', async () => {
      jest.spyOn(em, 'findOneOrFail').mockResolvedValueOnce({ user: {} });

      const result = await service.updateQuiz(1, {});

      expect(result).toEqual({});
    });

    it('should update quiz user and return token', async () => {
      jest.spyOn(em, 'findOneOrFail').mockResolvedValueOnce({ user: null });
      jest.spyOn(service, 'findOrCreateUser').mockResolvedValueOnce({ id: 1 } as any);

      const result = await service.updateQuiz(1, { cmid: '1', path: 'chunk1;chunk2' });
      expect(result).toHaveProperty('token');
    });
  });

  describe('finishQuiz', () => {
    it('should throw bad request if quiz result is already finished', async () => {
      jest.spyOn(em, 'findOne').mockResolvedValueOnce({ result: {} });

      await expect(service.finishQuiz('1', {} as any)).rejects.toThrowError('Тест уже завершен');
    });

    it('should finish quiz', async () => {
      const answers = [{ nativeId: 1 }, { nativeId: 2 }, { nativeId: 3 }];
      jest.spyOn(em, 'findOne').mockResolvedValueOnce({ result: null, attemptAnswers: { getItems: jest.fn().mockReturnValue(answers) } });

      const result = await service.finishQuiz('1', { incorrectQuestions: ['3', '4'], summaryData: {} });
      expect(result.attemptStatus).toBe(AttemptStatus.FINISHED);
      expect(result.attemptAnswers.getItems()[0].finalResult).toBe(QuestionResult.SUCCESS);
      expect(result.attemptAnswers.getItems()[1].finalResult).toBe(QuestionResult.FAILED);
    });
  });

  describe('createQuiz', () => {
    const CreateQuizDto = { code: 'test', cmid: '1', path: 'chunk1;chunk2', user: { name: 'test', id: '1', login: 'test' } };
    it('should throw error', async () => {
      jest.spyOn(em, 'findOne').mockResolvedValueOnce(null);

      expect(service.createQuiz(CreateQuizDto)).rejects.toThrowError('Неверный код');
    });

    it('should throw already activated error', async () => {
      jest.spyOn(em, 'findOne').mockResolvedValueOnce({ status: CodeStatus.DISABLED });
      expect(service.createQuiz(CreateQuizDto)).rejects.toThrowError('Код уже активирован');
    });

    it('should create quiz', async () => {
      const code = { id: 1, value: 'test', status: CodeStatus.ACTIVE };
      const user = { id: 1, name: 'test', login: 'test' };
      jest.spyOn(em, 'findOne').mockResolvedValueOnce(code);
      jest.spyOn(service, 'findOrCreateUser').mockResolvedValueOnce(user as any);
      jest.spyOn(em, 'create').mockReturnValueOnce({ id: 1 });
      const result = await service.createQuiz(CreateQuizDto);
      expect(em.create).toBeCalledWith(expect.anything(), { code, user, cmid: '1', path: 'chunk1;chunk2' });
      expect(result).toHaveProperty('token');
    });
  });
});
