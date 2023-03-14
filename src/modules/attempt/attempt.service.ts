import { EntityManager } from '@mikro-orm/core';
import { HttpException, Injectable } from '@nestjs/common';
import { UpdateAnswerDto } from '../answers/dto/update-answer.dto';
import { QuizAttempt } from '../mikroorm/entities/QuizAttempt';
import { QuizAttemptAnswer } from '../mikroorm/entities/QuizAttemptAnswer';
import { RetrieveAttemptAnswerDto } from './dto/retrieve-attempt-answer.dto';
import { RetrieveAttemptDto } from './dto/retrieve-attempt.dto';
import { UpdateAttemptAnswerDto } from './dto/update-attempt-answer.dto';
import { UpdateAttemptDto } from './dto/update-attempt.dto';

@Injectable()
export class AttemptService {
  constructor(private readonly em: EntityManager) {}

  async updatePattern(attemptAnswerId: number, updateAnswerDto: UpdateAnswerDto) {
    const attemptAnswer = await this.em.findOneOrFail(QuizAttemptAnswer, attemptAnswerId, { populate: ['answer'] });
    if (attemptAnswer.answer) {
      try {
        JSON.parse(updateAnswerDto.json);
        attemptAnswer.answer.jsonAnswer = updateAnswerDto.json;
        await this.em.persistAndFlush(attemptAnswer);
        return new RetrieveAttemptAnswerDto(attemptAnswer);
      } catch (error) {
        throw new HttpException('Invalid JSON', 400);
      }
    } else {
      throw new HttpException('Answer not found', 404);
    }
  }
  async update(id: number, updateAttemptDto: UpdateAttemptDto) {
    const attempt = await this.em.findOneOrFail(QuizAttempt, id, { populate: ['user', 'attemptAnswers.answer'] });
    attempt.attemptStatus = updateAttemptDto.status;
    await this.em.persistAndFlush(attempt);
    return new RetrieveAttemptDto(attempt);
  }
  async findAll() {
    const attempts = await this.em.find(QuizAttempt, {}, { populate: ['user', 'attemptAnswers.answer'] });
    return attempts.map((attempt) => new RetrieveAttemptDto(attempt));
  }

  async updateAnswer(id: number, updateAttemptAnswerDto: UpdateAttemptAnswerDto) {
    const attemptAnswer = await this.em.findOneOrFail(QuizAttemptAnswer, id, { populate: ['answer'] });
    updateAttemptAnswerDto.answered !== undefined ? (attemptAnswer.answered = updateAttemptAnswerDto.answered) : null;
    await this.em.persistAndFlush(attemptAnswer);
    return new RetrieveAttemptAnswerDto(attemptAnswer);
  }
}
