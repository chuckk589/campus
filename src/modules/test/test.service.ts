import { EntityManager } from '@mikro-orm/core';
import { HttpException, Injectable } from '@nestjs/common';
import { QuizAnswer } from '../mikroorm/entities/QuizAnswer';
import { HTMLCampusParser, QuestionType } from 'src/types/interfaces';

@Injectable()
export class TestService {
  constructor(private readonly em: EntityManager) {}

  async findAll(query: { limit: number; offset: number }) {
    throw new HttpException('Forbidden', 403);
    const answers = await this.em.findAndCount(
      QuizAnswer,
      { question_type: { $in: [0, 1, 2, 3] } },
      { limit: query.limit, offset: query.offset },
    );
    const questionTypes = ['checkbox', 'select', 'radio', 'input'];
    return answers[0]
      .filter((answer) => {
        return [0, 2].includes(answer.question_type);
      })
      .map((answer) => {
        return {
          id: answer.id,
          type: answer.question_type,
          test: HTMLCampusParser.parse_question_data(answer.html, answer.question_type as QuestionType),
        };
      });
    // return {
    //   rows: answers[0].map((answer) => {
    //     return {
    //       id: answer.id,
    //       question: HTMLCampusParser.extract_text_DEV(answer.html, answer.question_type as QuestionType, true),
    //       answer: HTMLCampusParser.extract_answers_DEV(answer.html, answer.question_type as QuestionType, answer.jsonAnswer),
    //       type: {
    //         id: answer.question_type,
    //         name: questionTypes[answer.question_type],
    //       },
    //     };
    //   }),
    //   total: answers[1],
    // };
  }
}
