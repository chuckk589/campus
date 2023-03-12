import { Entity, Enum, ManyToOne, PrimaryKey, PrimaryKeyType, Property } from '@mikro-orm/core';
import { CustomBaseEntity } from './CustomBaseEntity';
import { QuizAnswer } from './QuizAnswer';
import { QuizAttempt } from './QuizAttempt';

export enum QuestionResult {
  SUCCESS = 'success',
  FAILED = 'failed',
  DEFAULT = 'default',
}

@Entity()
export class QuizAttemptAnswer extends CustomBaseEntity {
  @Property()
  nativeId?: number;

  @Property({ default: false })
  answered?: boolean;

  @Enum({ items: () => QuestionResult, default: QuestionResult.DEFAULT })
  finalResult!: QuestionResult;

  @ManyToOne(() => QuizAttempt, { primary: true })
  attempt: QuizAttempt;

  @ManyToOne(() => QuizAnswer, { primary: true })
  answer: QuizAnswer;

  [PrimaryKeyType]?: [number, number];
}
