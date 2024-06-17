import { HttpException, Injectable } from '@nestjs/common';
import { UpdateAnswerDto } from '../answers/dto/update-answer.dto';
import { QuizAttempt } from '../mikroorm/entities/QuizAttempt';
import { QuizAttemptAnswer } from '../mikroorm/entities/QuizAttemptAnswer';
import { RetrieveAttemptDto } from './dto/retrieve-attempt.dto';
import { UpdateAttemptDto } from './dto/update-attempt.dto';
import { QuestionType, ReqUser } from 'src/types/interfaces';
import { OpenAiService } from 'src/libs/openai/openai.service';
import { AttemptDto } from './dto/attempt.dto';
import { IServerSideGetRowsRequest } from 'src/types/agGridTypes';
import { AgGridORMConverter } from 'src/types/agGridORM';
import { Owner, OwnerRole } from '../mikroorm/entities/Owner';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { EntityManager } from '@mikro-orm/mysql';
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
  async lazyload(body: IServerSideGetRowsRequest, user: ReqUser) {
    const qb = this.em.createQueryBuilder(QuizAttempt, 'qat');
    qb.select(['qat.*', `SUM(CASE WHEN qa.json_answer is NULL OR qaa.final_result = 'failed' THEN 1 ELSE 0 END) as unanswered`])
      .leftJoin('qat.attemptAnswers', 'qaa')
      .leftJoin('qaa.answer', 'qa')
      .where({ user: { $ne: null }, ...(user.role == OwnerRole.ADMIN ? {} : { code: { createdBy: { id: user.id } } }) })
      .groupBy('qat.id')
      .limit(body.endRow - body.startRow)
      .offset(body.startRow);
    AgGridORMConverter.ApplyFilters(qb, body.filterModel, AttemptDto);
    AgGridORMConverter.ApplySort(qb, body.sortModel, AttemptDto);
    const attempts = await qb.getResultList();
    await this.em.populate(attempts, ['user', 'attemptAnswers.answer.updatedBy']);
    return { rows: attempts };
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
      await this.em.populate(attemptAnswer, ['answer.updatedBy']);
      return attemptAnswer;
    } else {
      throw new HttpException('Answer not found', 404);
    }
  }

  async update(id: number, updateAttemptDto: UpdateAttemptDto) {
    const attempt = await this.em.findOneOrFail(QuizAttempt, id, { populate: ['user', 'attemptAnswers.answer'] });
    attempt.attemptStatus = updateAttemptDto.status;
    attempt.editable = updateAttemptDto.editable;
    await this.em.persistAndFlush(attempt);
    return new RetrieveAttemptDto(attempt);
  }

  // async updateAnswer(user: ReqUser, id: number, updateAttemptAnswerDto: UpdateAttemptAnswerDto) {
  //   const attemptAnswer = await this.em.findOneOrFail(QuizAttemptAnswer, id, { populate: ['answer'] });
  //   updateAttemptAnswerDto.answered !== undefined ? (attemptAnswer.answered = updateAttemptAnswerDto.answered) : null;
  //   await this.em.persistAndFlush(attemptAnswer);
  //   return new RetrieveAttemptAnswerDto(attemptAnswer, user);
  // }
}
