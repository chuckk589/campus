import { OwnerRole } from 'src/modules/mikroorm/entities/Owner';
import { QuizAttemptAnswer } from 'src/modules/mikroorm/entities/QuizAttemptAnswer';
import { ReqUser } from 'src/types/interfaces';

export class RetrieveAttemptAnswerDto {
  constructor(attemptAnswer: QuizAttemptAnswer, user: ReqUser) {
    const showJson =
      user.role == OwnerRole.ADMIN ||
      user.permissions.includes('quiz_edit_own') ||
      attemptAnswer.attempt.editable ||
      !attemptAnswer.answer.jsonAnswer;
    this.id = attemptAnswer.id.toString();
    this.nativeId = attemptAnswer.nativeId.toString();
    this.html = attemptAnswer.answer.html;
    this.answered = attemptAnswer.answered;
    this.result = attemptAnswer.finalResult;
    this.question_type = attemptAnswer.answer.question_type.toString();
    this.updatedBy = attemptAnswer.answer.updatedBy?.username;
    this.disabled = showJson ? false : true;
    this.jsonAnswer = showJson ? attemptAnswer.answer.jsonAnswer : null;
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
