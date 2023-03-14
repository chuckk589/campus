import { EntityManager } from '@mikro-orm/mysql';
import { Injectable } from '@nestjs/common';
import { QuizResult } from '../mikroorm/entities/QuizResult';
import { RetrieveResultDto } from './dto/retrieve-result.dto';

@Injectable()
export class ResultsService {
  constructor(private readonly em: EntityManager) {}

  async findAll(): Promise<RetrieveResultDto[]> {
    const results = await this.em.find(QuizResult, {}, { populate: ['attempt.user'] });
    return results.map((result) => new RetrieveResultDto(result));
  }
}
