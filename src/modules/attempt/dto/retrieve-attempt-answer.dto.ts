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
    if (role != OwnerRole.ADMIN && attemptAnswer.answer.jsonAnswer) {
      this.jsonAnswer = null;
      this.disabled = true;
    } else {
      this.jsonAnswer = attemptAnswer.answer.jsonAnswer;
    }
  }
  id: string;
  nativeId: string;
  html: string;
  jsonAnswer: string;
  answered: boolean;
  result: string;
  question_type: string;
  disabled = false;
}
