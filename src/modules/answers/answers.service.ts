import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { HttpException } from '@nestjs/common/exceptions';
import { QuizAnswer } from '../mikroorm/entities/QuizAnswer';
import { RetrieveAnswerDto } from './dto/retrieve-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';

@Injectable()
export class AnswersService {
  constructor(private readonly em: EntityManager) {}
  // create(createAnswerDto: CreateAnswerDto) {
  //   return 'This action adds a new answer';
  // }

  async findAll() {
    const answers = await this.em.find(QuizAnswer, {});
    return answers.map((answer) => new RetrieveAnswerDto(answer));
  }

  async update(id: number, updateAnswerDto: UpdateAnswerDto) {
    try {
      JSON.parse(updateAnswerDto.json);
      const answer = await this.em.findOneOrFail(QuizAnswer, id);
      answer.jsonAnswer = updateAnswerDto.json;
      await this.em.persistAndFlush(answer);
      return new RetrieveAnswerDto(answer);
    } catch (error) {
      throw new HttpException('Invalid JSON', 400);
    }
  }
  // findOne(id: number) {
  //   return `This action returns a #${id} answer`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} answer`;
  // }
}
