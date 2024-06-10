import { OwnerRole } from 'src/modules/mikroorm/entities/Owner';
import { QuizAttemptAnswer } from 'src/modules/mikroorm/entities/QuizAttemptAnswer';

export class RetrieveAttemptAnswerDto {
  constructor(attemptAnswer: QuizAttemptAnswer, role: OwnerRole = OwnerRole.ADMIN) {
    this.id = attemptAnswer.id.toString();
    this.nativeId = attemptAnswer.nativeId.toString();
    this.html = attemptAnswer.answer.html;
    this.answered = attemptAnswer.answered;
    this.result = attemptAnswer.finalResult;
    this.question_type = attemptAnswer.answer.question_type.toString();
    if (role == OwnerRole.ADMIN || attemptAnswer.attempt.editable || !attemptAnswer.answer.jsonAnswer) {
      this.disabled = false;
      this.jsonAnswer = attemptAnswer.answer.jsonAnswer;
    } else {
      this.jsonAnswer = null;
      this.disabled = true;
    }
    this.updatedBy = attemptAnswer.answer.updatedBy?.username;
  }
  id: string;
  nativeId: string;
  html: string;
  jsonAnswer: string;
  answered: boolean;
  result: string;
  question_type: string;
  disabled = false;
  updatedBy: string;
}
