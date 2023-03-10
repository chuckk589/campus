import { RetrieveAnswerDto } from 'src/modules/answers/dto/retrieve-answer.dto';
import { QuizAnswer } from 'src/modules/mikroorm/entities/QuizAnswer';
import { QuizAttempt } from 'src/modules/mikroorm/entities/QuizAttempt';

export class RetrieveAttemptDto {
  constructor(attempt: QuizAttempt) {
    this.id = attempt.id.toString();
    this.attemptId = attempt.attemptId?.toString();
    this.questionAmount = attempt.questionAmount?.toString();
    this.cmid = attempt.cmid?.toString();
    this.time = attempt.time?.toString();
    this.userId = attempt.user.id.toString();
    this.userName = attempt.user?.name;
    this.createdAt = attempt.createdAt;
    this.answers = attempt.attemptAnswers.getItems().map((item) => new RetrieveAnswerDto(item.answer));
  }
  createdAt: Date;
  id: string;
  attemptId: string;
  questionAmount: string;
  cmid: string;
  time: string;
  userId: string;
  userName: string;
  answers: RetrieveAnswerDto[];
}
