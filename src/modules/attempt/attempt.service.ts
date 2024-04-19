import { EntityManager } from '@mikro-orm/core';
import { HttpException, Injectable } from '@nestjs/common';
import { UpdateAnswerDto } from '../answers/dto/update-answer.dto';
import { QuizAttempt } from '../mikroorm/entities/QuizAttempt';
import { QuizAttemptAnswer } from '../mikroorm/entities/QuizAttemptAnswer';
import { RetrieveAttemptAnswerDto } from './dto/retrieve-attempt-answer.dto';
import { RetrieveAttemptDto } from './dto/retrieve-attempt.dto';
import { UpdateAttemptAnswerDto } from './dto/update-attempt-answer.dto';
import { UpdateAttemptDto } from './dto/update-attempt.dto';
import { IServerSideGetRowsRequest } from 'src/types/interfaces';
import { OpenAiService } from 'src/libs/openai/openai.service';

@Injectable()
export class AttemptService {
  constructor(private readonly em: EntityManager, private readonly openAI: OpenAiService) {}

  async lazyload(body: IServerSideGetRowsRequest) {
    const attempts = await this.em.find(
      QuizAttempt,
      { user: { $ne: null } },
      {
        populate: ['user', 'attemptAnswers.answer'],
        limit: body.endRow - body.startRow,
        offset: body.startRow,
        orderBy: body.sortModel.map((sort) => ({ [sort.colId]: sort.sort })),
      },
    );
    const attemptsCount = await this.em.count(QuizAttempt, { user: { $ne: null } });
    return {
      rows: attempts.map((attempt) => new RetrieveAttemptDto(attempt)),
      lastRow: attemptsCount,
    };
  }

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
    const attempts = await this.em.find(QuizAttempt, { user: { $ne: null } }, { populate: ['user', 'attemptAnswers.answer'] });
    return attempts.map((attempt) => new RetrieveAttemptDto(attempt));
  }

  async updateAnswer(id: number, updateAttemptAnswerDto: UpdateAttemptAnswerDto) {
    const attemptAnswer = await this.em.findOneOrFail(QuizAttemptAnswer, id, { populate: ['answer'] });
    updateAttemptAnswerDto.answered !== undefined ? (attemptAnswer.answered = updateAttemptAnswerDto.answered) : null;
    await this.em.persistAndFlush(attemptAnswer);
    return new RetrieveAttemptAnswerDto(attemptAnswer);
  }
}
