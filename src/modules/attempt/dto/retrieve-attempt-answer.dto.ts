import { QuizAttemptAnswer } from 'src/modules/mikroorm/entities/QuizAttemptAnswer';

export class RetrieveAttemptAnswerDto {
  constructor(attemptAnswer: QuizAttemptAnswer) {
    this.id = attemptAnswer.answer.id.toString();
    this.html = attemptAnswer.answer.html;
    this.jsonAnswer = attemptAnswer.answer.jsonAnswer;
    this.nativeId = attemptAnswer.nativeId.toString();
    this.answered = attemptAnswer.answered;
    this.result = attemptAnswer.finalResult;
  }
  id: string;
  nativeId: string;
  html: string;
  jsonAnswer: string;
  answered: boolean;
  result: string;
}
