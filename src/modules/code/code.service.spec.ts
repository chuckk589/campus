import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/core';
import { CodeService } from './code.service';
import { RetrieveCodeDto } from './dto/retrieve-code.dto';

const codeFactory = () => ({
  id: Date.now(),
  value: 'test',
  status: 'active',
  attempt: {
    id: Date.now(),
    attemptId: 'test',
    questionAmount: 0,
    attemptStatus: 'initiated',
    cmid: 'test',
    path: 'test',
    user: { id: Date.now() },
    attemptAnswers: { getItems: jest.fn().mockImplementation(() => []) },
    result: { id: Date.now() },
  },
});

describe('CodeService', () => {
  let service: CodeService;
  const mockCodeRepository = {
    find: jest.fn().mockImplementation(async () => Array(2).fill(codeFactory())),
    findOne: jest.fn().mockImplementation(async () => codeFactory()),
    create: jest.fn().mockImplementation((data) => ({ ...codeFactory(), ...data })),
  };
  const mockUserRestrictionRepository = {
    find: jest.fn().mockImplementation(async () => []),
  };
  const mockEntityManager = {
    persistAndFlush: jest.fn().mockImplementation(async () => {}),
    flush: jest.fn().mockImplementation(async () => {}),
    getRepository: jest.fn().mockImplementation(() => {}),
    remove: jest.fn().mockImplementation(async (entities: any[]) => entities.map((entity) => entity.id)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CodeService,
        {
          provide: EntityManager,
          useValue: mockEntityManager,
        },
      ],
    }).compile();

    service = module.get<CodeService>(CodeService);

    service.codeRepository = mockCodeRepository as any;
    service.userRestrictionRepository = mockUserRestrictionRepository as any;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should update code', async () => {
    const result = await service.update(1, { status: 'active' as any });
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(RetrieveCodeDto);
    expect(result.status).toBe('active');
  });

  it('should remove code', async () => {
    const result = await service.remove([1, 2, 3]);
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(Array);
  });

  it('should create code', async () => {
    const result = await service.create({ amount: '2' });
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(Array);
    expect(result[0]).toBeInstanceOf(RetrieveCodeDto);
    expect(result.length).toBe(2);
  });

  it('should find all codes', async () => {
    const result = await service.findAll();
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(Array);
    expect(result[0]).toBeInstanceOf(RetrieveCodeDto);
  });
});
