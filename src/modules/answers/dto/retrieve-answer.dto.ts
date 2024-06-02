import { IsNumberString } from 'class-validator';
import { Code } from 'src/modules/mikroorm/entities/Code';
import { QuizAnswer } from 'src/modules/mikroorm/entities/QuizAnswer';

export class RetrieveAnswerDto {
  constructor(answer: QuizAnswer) {
    this.id = answer.id.toString();
    this.question_hash = answer.question_hash;
    this.question_type = answer.question_type.toString();
    this.html = answer.html;
    this.jsonAnswer = answer.jsonAnswer;
    this.createdAt = answer.createdAt;
    this.updatedBy = answer.updatedBy?.username;
  }
  id: string;
  question_hash: string;
  question_type: string;
  html: string;
  jsonAnswer: string;
  createdAt: Date;
  updatedBy: string;
}
