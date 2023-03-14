import { QuizResult } from 'src/modules/mikroorm/entities/QuizResult';

export class RetrieveResultDto {
  constructor(result: QuizResult) {
    this.id = result.id.toString();
    this.attemptId = result.attempt.attemptId;
    this.userName = result.attempt.user.name;
    this.startedAt = result.startedAt;
    this.finishedAt = result.finishedAt;
    this.status = result.status;
    this.timeElapsed = result.timeElapsed;
    this.points = result.points;
    this.mark = result.mark;
    this.feedback = result.feedback;
  }
  id: string;
  attemptId: string;
  userName: string;
  startedAt: string;
  finishedAt: string;
  status: string;
  timeElapsed: string;
  points: string;
  mark: string;
  feedback: string;
}
