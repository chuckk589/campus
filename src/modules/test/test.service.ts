import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { QuizAnswer } from '../mikroorm/entities/QuizAnswer';
import { HTMLCampusParser, QuestionType } from 'src/types/interfaces';

@Injectable()
export class TestService {
  constructor(private readonly em: EntityManager) {}

  async findAll(query: { limit: number; offset: number }) {
    const answers = await this.em.findAndCount(QuizAnswer, {}, { limit: query.limit, offset: query.offset });

    const questionTypes = ['checkbox', 'select', 'radio', 'input'];
    return {
      rows: answers[0].map((answer) => {
        return {
          id: answer.id,
          question: HTMLCampusParser.extract_text(answer.html, answer.question_type as QuestionType, true),
          type: {
            id: answer.question_type,
            name: questionTypes[answer.question_type],
          },
        };
      }),
      total: answers[1],
    };
  }

  // async findAll() {
  //   const answers = await this.em.find(QuizAnswer, {});

  //   const questionTypes = ['checkbox', 'select', 'radio', 'input'];
  //   return answers.map((answer) => {
  //     return {
  //       id: answer.id,
  //       output: HTMLCampusParser.extract_text(answer.html, answer.question_type as QuestionType, true),
  //       type: {
  //         id: answer.question_type,
  //         name: questionTypes[answer.question_type],
  //       },
  //     };
  //   });
  // }
}
