import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { HttpException, Injectable } from '@nestjs/common';
import { UpdateAnswerDto } from '../answers/dto/update-answer.dto';
import { QuizAttempt } from '../mikroorm/entities/QuizAttempt';
import { QuizAttemptAnswer } from '../mikroorm/entities/QuizAttemptAnswer';
import { RetrieveAttemptAnswerDto } from './dto/retrieve-attempt-answer.dto';
import { RetrieveAttemptDto } from './dto/retrieve-attempt.dto';
import { UpdateAttemptAnswerDto } from './dto/update-attempt-answer.dto';
import { UpdateAttemptDto } from './dto/update-attempt.dto';
import { IServerSideGetRowsRequest, QuestionType } from 'src/types/interfaces';
import { OpenAiService } from 'src/libs/openai/openai.service';

@Injectable()
export class AttemptService {
  constructor(private readonly em: EntityManager, private readonly openAiService: OpenAiService) {}

  async getAiAnswer(id: number) {
    const attemptAnswer = await this.em.findOneOrFail(QuizAttemptAnswer, { id }, { populate: ['answer'] });
    return await this.openAiService.getAIResponse(attemptAnswer.answer.html, attemptAnswer.answer.question_type as QuestionType);
  }

  async lazyload(body: IServerSideGetRowsRequest) {
    const attempts = await this.em.findAndCount(
      QuizAttempt,
      { user: { $ne: null } },
      {
        populate: ['user', 'attemptAnswers.answer'],
        limit: body.endRow - body.startRow,
        offset: body.startRow,
        orderBy: body.sortModel
          .filter((sort) => ['id', 'attemptId', 'questionAmount', 'attemptStatus', 'cmid', 'path', 'parsingState'].includes(sort.colId))
          .map((sort) => ({ [sort.colId]: sort.sort })),
      },
    );
    return {
      rows: attempts[0].map((attempt) => new RetrieveAttemptDto(attempt)),
      lastRow: attempts[1],
    };
  }

  async updatePattern(user: ReqUser, attemptAnswerId: number, updateAnswerDto: UpdateAnswerDto) {
    const attemptAnswer = await this.em.findOneOrFail(QuizAttemptAnswer, attemptAnswerId, {
      populate: ['answer', 'attempt.code.createdBy'],
    });

    //only allow admin or owner of code which is associated with the attempt to update the answer
    if (user.role != OwnerRole.ADMIN && user.id != attemptAnswer.attempt?.code?.createdBy?.id) {
      this.logger.warn(`User ${user.id} attempted to update answer ${attemptAnswerId} but is not the owner of the code`);
      throw new HttpException('Insufficient permissions', 405);
    }

    if (attemptAnswer.answer) {
      try {
        JSON.parse(updateAnswerDto.json);
      } catch (error) {
        throw new HttpException('Invalid JSON', 400);
      }
      attemptAnswer.answer.jsonAnswer = updateAnswerDto.json;
      await this.em.persistAndFlush(attemptAnswer);
      return new RetrieveAttemptAnswerDto(attemptAnswer);
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
