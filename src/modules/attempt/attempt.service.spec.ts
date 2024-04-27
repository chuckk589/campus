import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/core';
import { OpenAiService } from 'src/libs/openai/openai.service';
import { AttemptService } from './attempt.service';
import { RetrieveAttemptAnswerDto } from './dto/retrieve-attempt-answer.dto';
import { AttemptStatus } from '../mikroorm/entities/QuizResult';
import { RetrieveAttemptDto } from './dto/retrieve-attempt.dto';

describe('AttemptService', () => {
  let service: AttemptService;

  const mockQuizAttemptRepository = {
    find: jest.fn().mockImplementation(async () => []),
    findAll: jest.fn().mockImplementation(() => []),
    count: jest.fn().mockImplementation(() => 0),
    findOneOrFail: jest.fn().mockImplementation((options) => ({
      id: Date.now(),
      user: options.user || { id: Date.now() },
      attemptAnswers: { getItems: jest.fn().mockImplementation(() => []) },
      attemptStatus: options.attemptStatus || 'started',
    })),
  };

  const mockQuizAttemptAnswerRepository = {
    findOneOrFail: jest.fn().mockImplementation(() => ({
      id: Date.now(),
      nativeId: Date.now(),
      answer: {
        id: Date.now(),
        html: '<div>test</div>',
        jsonAnswer: '{}',
        question_hash: Date.now().toString(),
        question_type: 1,
      },
    })),
  };

  const mockEntityManager = {
    persistAndFlush: jest.fn().mockImplementation(async () => {}),
    getRepository: jest.fn().mockImplementation(() => {}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttemptService,
        {
          provide: EntityManager,
          useValue: mockEntityManager,
        },
      ],
    }).compile();

    service = module.get<AttemptService>(AttemptService);

    service.quizAttemptRepository = mockQuizAttemptRepository as any;
    service.quizAttemptAnswerRepository = mockQuizAttemptAnswerRepository as any;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return an array of attempts', async () => {
    const attempts = await service.lazyload({
      startRow: 0,
      endRow: 10,
      rowGroupCols: [],
      valueCols: [],
      pivotCols: [],
      pivotMode: false,
      groupKeys: [],
      sortModel: [],
    });
    expect(attempts).toBeInstanceOf(Object);
    expect(attempts.rows).toBeInstanceOf(Array);
    expect(attempts.lastRow).toBe(0);
  });

  it('should update attempt pattern', async () => {
    await expect(service.updatePattern(1, { json: 'test' })).rejects.toThrow();
    const attemptAnswer = await service.updatePattern(1, { json: '{"test": "test"}' });
    expect(attemptAnswer).toBeInstanceOf(RetrieveAttemptAnswerDto);
    expect(attemptAnswer.jsonAnswer).toBe('{"test": "test"}');
  });

  it('should update attempt', async () => {
    const attempt = await service.update(1, { status: 'completed' as AttemptStatus });
    expect(attempt).toBeInstanceOf(RetrieveAttemptDto);
    expect(attempt.status).toBe('completed');
  });

  it('should return an array of attempts', async () => {
    const attempts = await service.findAll();
    expect(attempts).toBeInstanceOf(Array);
  });

  it('should update attempt answer', async () => {
    expect((await service.updateAnswer(1, { answered: true })).answered).toBe(true);
    expect((await service.updateAnswer(1, { answered: false })).answered).toBe(false);
    expect((await service.updateAnswer(1, { answered: undefined })).answered).toBe(undefined);
  });
});
