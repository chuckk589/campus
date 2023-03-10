import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { QuizAttempt } from '../mikroorm/entities/QuizAttempt';
import { CreateAttemptDto } from './dto/create-attempt.dto';
import { RetrieveAttemptDto } from './dto/retrieve-attempt.dto';
import { UpdateAttemptDto } from './dto/update-attempt.dto';

@Injectable()
export class AttemptService {
  constructor(private readonly em: EntityManager) {}
  create(createAttemptDto: CreateAttemptDto) {
    return 'This action adds a new attempt';
  }

  async findAll() {
    const attempts = await this.em.find(QuizAttempt, {}, { populate: ['user', 'attemptAnswers.answer'] });
    return attempts.map((attempt) => new RetrieveAttemptDto(attempt));
  }

  findOne(id: number) {
    return `This action returns a #${id} attempt`;
  }

  update(id: number, updateAttemptDto: UpdateAttemptDto) {
    return `This action updates a #${id} attempt`;
  }

  remove(id: number) {
    return `This action removes a #${id} attempt`;
  }
}
