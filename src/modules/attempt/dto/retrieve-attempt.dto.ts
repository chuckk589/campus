import { QuizAnswer } from 'src/modules/mikroorm/entities/QuizAnswer';
import { QuizAttempt } from 'src/modules/mikroorm/entities/QuizAttempt';
import { RetrieveAttemptAnswerDto } from './retrieve-attempt-answer.dto';
import { OwnerRole } from 'src/modules/mikroorm/entities/Owner';
import { ReqUser } from 'src/types/interfaces';

export class RetrieveAttemptDto {
  constructor(attempt: QuizAttempt, user: ReqUser = { role: OwnerRole.ADMIN } as ReqUser) {
    const attemptAnswers = attempt.attemptAnswers?.getItems();
    this.id = attempt.id.toString();
    this.attemptId = attempt.attemptId?.toString();
    this.questionAmount = attempt.questionAmount?.toString();
    this.cmid = attempt.cmid?.toString();
    this.userId = attempt.user?.id.toString();
    this.userName = attempt.user?.name;
    this.createdAt = attempt.createdAt;
    this.status = attempt.attemptStatus;
    this.answers = attemptAnswers.map((attemptAnswer) => new RetrieveAttemptAnswerDto(attemptAnswer, user));
    this.path = attempt.path ? attempt.path.split(';') : [];
    this.isProctoring = attempt.isProctoring;
    this.editable = attempt.editable;
    this.unanswered = attempt.unanswered;
  }
  createdAt: Date;
  id: string;
  attemptId: string;
  questionAmount: string;
  cmid: string;
  status: string;
  userId: string;
  path: string[];
  userName: string;
  answers: RetrieveAttemptAnswerDto[];
  isProctoring: boolean;
  editable: boolean;
  unanswered: number;
}
