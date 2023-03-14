import { QuizAttemptAnswer } from 'src/modules/mikroorm/entities/QuizAttemptAnswer';

export class RetrieveAttemptAnswerDto {
  constructor(attemptAnswer: QuizAttemptAnswer) {
    this.id = attemptAnswer.id.toString();
    this.html = attemptAnswer.answer.html;
    this.jsonAnswer = attemptAnswer.answer.jsonAnswer;
    this.nativeId = attemptAnswer.nativeId.toString();
    this.answered = attemptAnswer.answered;
    this.result = attemptAnswer.finalResult;
    this.question_type = attemptAnswer.answer.question_type.toString();
  }
  id: string;
  nativeId: string;
  html: string;
  jsonAnswer: string;
  answered: boolean;
  result: string;
  question_type: string;
}
