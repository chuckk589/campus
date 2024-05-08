import { EntityManager } from '@mikro-orm/core';
import { HttpException, Injectable } from '@nestjs/common';
import { QuizAnswer } from '../mikroorm/entities/QuizAnswer';
import { HTMLCampusParser, QuestionType } from 'src/types/interfaces';

@Injectable()
export class TestService {
  constructor(private readonly em: EntityManager) {}

  async getSampleResult(body: any) {
    const ids = body.map((item: { id: number }) => item.id);
    const answers = await this.em.find(QuizAnswer, { id: { $in: ids } });
    const [inputs, ...rest] = [
      answers.filter((answer) => answer.question_type === 3),
      ...answers.filter((answer) => answer.question_type !== 3),
    ];
    const result = {
      passed: 0,
      failed: 0,
      failedEntries: [] as any[],
      inputs: [] as any[],
      percentage: 0,
    };
    for (const answer of rest) {
      const question = HTMLCampusParser.parse_question_data(answer.html, answer.question_type as QuestionType);
      const parsedAnswer = HTMLCampusParser.parse_question_answers(question, answer.question_type as QuestionType, answer.jsonAnswer);
      const userAnswer = body.find((item: { id: number }) => item.id === answer.id);
      if (JSON.stringify(parsedAnswer) === JSON.stringify(userAnswer.answer)) {
        result.passed++;
      } else {
        result.failed++;
        result.failedEntries.push({
          id: answer.id,
          question,
          userAnswer: userAnswer.answer || null,
          correctAnswer: parsedAnswer,
        });
      }
    }
    for (const answer of inputs) {
      const question = HTMLCampusParser.parse_question_data(answer.html, answer.question_type as QuestionType);
      const userAnswer = body.find((item: { id: number }) => item.id === answer.id);
      result.inputs.push({
        id: answer.id,
        question,
        userAnswer,
      });
    }
    result.percentage = (result.passed / (result.passed + result.failed)) * 100;
    return result;
  }

  async getSample() {
    const answers = await this.em.find(QuizAnswer, { question_type: { $in: [0, 1, 2, 3] }, jsonAnswer: { $ne: null } }, { limit: 150 });
    const questionTypes = ['checkbox', 'select', 'radio', 'input'];
    return answers.map((answer) => {
      const question = HTMLCampusParser.parse_question_data(answer.html, answer.question_type as QuestionType);
      return {
        id: answer.id,
        type: {
          id: answer.question_type,
          name: questionTypes[answer.question_type],
        },
        question,
        // answer: HTMLCampusParser.parse_question_answers(question, answer.question_type as QuestionType, answer.jsonAnswer),
      };
    });
  }

  async findAll(query: { limit: number; offset: number }) {
    const answers = await this.em.findAndCount(
      QuizAnswer,
      { question_type: { $in: [0, 1, 2, 3] } },
      { limit: query.limit, offset: query.offset },
    );
    const questionTypes = ['checkbox', 'select', 'radio', 'input'];
    return answers[0].map((answer) => {
      const question = HTMLCampusParser.parse_question_data(answer.html, answer.question_type as QuestionType);
      return {
        id: answer.id,
        type: {
          id: answer.question_type,
          name: questionTypes[answer.question_type],
        },
        question: question,
        answer: HTMLCampusParser.parse_question_answers(question, answer.question_type as QuestionType, answer.jsonAnswer),
      };
    });
  }
}
