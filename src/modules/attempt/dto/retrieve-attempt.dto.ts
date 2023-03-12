import { QuizAnswer } from 'src/modules/mikroorm/entities/QuizAnswer';
import { QuizAttempt } from 'src/modules/mikroorm/entities/QuizAttempt';
import { RetrieveAttemptAnswerDto } from './retrieve-attempt-answer.dto';

export class RetrieveAttemptDto {
  constructor(attempt: QuizAttempt) {
    this.id = attempt.id.toString();
    this.attemptId = attempt.attemptId?.toString();
    this.questionAmount = attempt.questionAmount?.toString();
    this.cmid = attempt.cmid?.toString();
    this.userId = attempt.user.id.toString();
    this.userName = attempt.user?.name;
    this.createdAt = attempt.createdAt;
    this.status = attempt.attemptStatus;
    this.answers = attempt.attemptAnswers.getItems().map((attemptAnswer) => new RetrieveAttemptAnswerDto(attemptAnswer));
  }
  createdAt: Date;
  id: string;
  attemptId: string;
  questionAmount: string;
  cmid: string;
  status: string;
  userId: string;
  userName: string;
  answers: RetrieveAttemptAnswerDto[];
}
