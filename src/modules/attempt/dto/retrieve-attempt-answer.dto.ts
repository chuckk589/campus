import { QuizAnswerState } from 'src/modules/mikroorm/entities/QuizAnswerState';
import { QuizAttemptAnswer } from 'src/modules/mikroorm/entities/QuizAttemptAnswer';
import { ReqUser } from 'src/types/interfaces';

export class RetrieveAttemptAnswerDto {
  constructor(attemptAnswer: QuizAttemptAnswer, user: ReqUser) {
    const showJson = user.hasQuizAnswerEditAccess() || attemptAnswer.attempt.editable || !attemptAnswer.answer.jsonAnswer;
    this.id = attemptAnswer.id.toString();
    this.nativeId = attemptAnswer.nativeId.toString();
    this.html = attemptAnswer.answer.html;
    this.answered = attemptAnswer.answered;
    this.state = attemptAnswer.answer.state;
    this.question_type = attemptAnswer.answer.question_type.toString();
    this.updatedBy = attemptAnswer.answer.updatedBy?.username;
    this.disabled = showJson ? false : true;
    this.jsonAnswer = showJson ? attemptAnswer.answer.jsonAnswer : null;
    this.states = user.hasHistoryAccess() ? attemptAnswer.answer.quizStates.map((state) => new RetrieveQuizAnswerStateDto(state)) : [];
  }
  id: string;
  nativeId: string;
  html: string;
  jsonAnswer: string;
  answered: boolean;
  state: string;
  question_type: string;
  disabled = false;
  updatedBy: string;
  states: RetrieveQuizAnswerStateDto[];
}

export class RetrieveQuizAnswerStateDto {
  constructor(answerState: QuizAnswerState) {
    this.jsonAnswer = answerState.jsonAnswer;
    this.updatedAt = answerState.updatedAt.toISOString();
  }
  jsonAnswer: string;
  updatedAt: string;
}
