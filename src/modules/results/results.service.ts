import { EntityManager } from '@mikro-orm/mysql';
import { Injectable } from '@nestjs/common';
import { QuizResult } from '../mikroorm/entities/QuizResult';
import { RetrieveResultDto } from './dto/retrieve-result.dto';
import { ReqUser } from 'src/types/interfaces';

@Injectable()
export class ResultsService {
  constructor(private readonly em: EntityManager) {}

  async findAll(user: ReqUser): Promise<RetrieveResultDto[]> {
    const results = await this.em.find(
      QuizResult,
      {
        ...(user.hasAdminRights() ? {} : { attempt: { code: { createdBy: user.id } } }),
      },
      { populate: ['attempt.user'] },
    );
    return results.map((result) => new RetrieveResultDto(result));
  }
}
