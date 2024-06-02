import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { HttpException, Injectable } from '@nestjs/common';
import { UpdateAnswerDto } from '../answers/dto/update-answer.dto';
import { QuizAttempt } from '../mikroorm/entities/QuizAttempt';
import { QuizAttemptAnswer } from '../mikroorm/entities/QuizAttemptAnswer';
import { RetrieveAttemptAnswerDto } from './dto/retrieve-attempt-answer.dto';
import { RetrieveAttemptDto } from './dto/retrieve-attempt.dto';
import { UpdateAttemptAnswerDto } from './dto/update-attempt-answer.dto';
import { UpdateAttemptDto } from './dto/update-attempt.dto';
import { QuestionType, ReqUser } from 'src/types/interfaces';
import { OpenAiService } from 'src/libs/openai/openai.service';
import { AttemptDto } from './dto/attempt.dto';
import { IServerSideGetRowsRequest } from 'src/types/agGridTypes';
import { AgGridORMConverter } from 'src/types/agGridORM';
import { Owner, OwnerRole } from '../mikroorm/entities/Owner';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
@Injectable()
export class AttemptService {
  constructor(
    private readonly em: EntityManager,
    private readonly openAiService: OpenAiService,
    @InjectPinoLogger(AttemptService.name)
    private readonly logger: PinoLogger,
  ) {}

  async getAiAnswer(id: number) {
    const attemptAnswer = await this.em.findOneOrFail(QuizAttemptAnswer, { id }, { populate: ['answer'] });
    return await this.openAiService.getAIResponse(attemptAnswer.answer.html, attemptAnswer.answer.question_type as QuestionType);
  }
  //TODO: consider using role interceptor
  async lazyload(body: IServerSideGetRowsRequest, user: ReqUser) {
    const agFilter = AgGridORMConverter.convertToWhereQuery(body.filterModel, AttemptDto.resolveColumnName);
    //return all attempts associated with owner who created them, or all attempts if user is admin
    const attempts = await this.em.findAndCount(
      QuizAttempt,
      {
        $and: agFilter.$and.concat([
          {
            user: { $ne: null },
            ...(user.role == OwnerRole.ADMIN
              ? {}
              : {
                  code: { createdBy: { id: user.id } },
                }),
          },
        ]),
      },
      {
        populate: ['user', 'attemptAnswers.answer'],
        limit: body.endRow - body.startRow,
        offset: body.startRow,
        orderBy: body.sortModel.map((sort) => AttemptDto.resolveColumnName(sort.colId)(sort.sort)) as any,
      },
    );
    return {
      rows: attempts[0].map((attempt: QuizAttempt) => new RetrieveAttemptDto(attempt, user.role as OwnerRole)),
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
      attemptAnswer.answer.updatedBy = this.em.getReference(Owner, user.id);
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

  // async findAll(user: ReqUser) {
  //   console.log(user);
  //   //return all attempts associated with owner who created them, or all attempts if user is admin
  //   const attempts = await this.em.find(
  //     QuizAttempt,
  //     {
  //       user: { $ne: null },
  //       ...(user.role == OwnerRole.ADMIN
  //         ? {}
  //         : {
  //             code: { createdBy: { id: user.id } },
  //           }),
  //     },
  //     { populate: ['user', 'attemptAnswers.answer', 'code.createdBy'] },
  //   );
  //   return attempts.map((attempt) => new RetrieveAttemptDto(attempt));
  // }

  async updateAnswer(id: number, updateAttemptAnswerDto: UpdateAttemptAnswerDto) {
    const attemptAnswer = await this.em.findOneOrFail(QuizAttemptAnswer, id, { populate: ['answer'] });
    updateAttemptAnswerDto.answered !== undefined ? (attemptAnswer.answered = updateAttemptAnswerDto.answered) : null;
    await this.em.persistAndFlush(attemptAnswer);
    return new RetrieveAttemptAnswerDto(attemptAnswer);
  }
}
