import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/core';
import { AnswersService } from './answers.service';
import { OpenAiService } from 'src/libs/openai/openai.service';
import { RetrieveAnswerDto } from './dto/retrieve-answer.dto';

describe('AnswersService', () => {
  let service: AnswersService;

  const mockQuizAnswerRepository = {
    find: jest.fn().mockImplementation(async () => []),
    count: jest.fn().mockImplementation(() => 0),
    findOneOrFail: jest.fn().mockImplementation((options) => ({
      id: Date.now(),
      html: options.html || '<div>test</div>',
      jsonAnswer: options.json || '{}',
      question_hash: options.question_hash || Date.now().toString(),
      question_type: options.question_type || 1,
    })),
  };
  const mockEntityManager = {
    persistAndFlush: jest.fn().mockImplementation(async () => {}),
    getRepository: jest.fn().mockImplementation(() => {}),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnswersService,
        {
          provide: EntityManager,
          useValue: mockEntityManager,
        },
        {
          provide: OpenAiService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AnswersService>(AnswersService);

    service.answersRepository = mockQuizAnswerRepository as any;
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should return an array of answers', async () => {
    const answers = await service.lazyload({
      startRow: 0,
      endRow: 10,
      rowGroupCols: [],
      valueCols: [],
      pivotCols: [],
      pivotMode: false,
      groupKeys: [],
      sortModel: [],
    });
    expect(answers).toBeInstanceOf(Object);
    expect(answers.rows).toBeInstanceOf(Array);
    expect(answers.lastRow).toBe(0);
  });
  it('should create a new answer', async () => {
    //TODO: Implement test
  });
  it('should return update answer', async () => {
    await expect(service.update(1, { json: 'test' })).rejects.toThrow();
    const answer = await service.update(1, { json: '{"test": "test"}' });
    expect(answer).toBeInstanceOf(RetrieveAnswerDto);
    expect(answer.jsonAnswer).toBe('{"test": "test"}');
  });
});
