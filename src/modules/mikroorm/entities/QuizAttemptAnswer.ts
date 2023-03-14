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
  @PrimaryKey()
  id!: number;

  @Property()
  nativeId?: number;

  @Property({ default: false })
  answered?: boolean;

  @Enum({ items: () => QuestionResult, default: QuestionResult.DEFAULT })
  finalResult!: QuestionResult;

  @ManyToOne(() => QuizAttempt)
  attempt: QuizAttempt;

  @ManyToOne(() => QuizAnswer)
  answer: QuizAnswer;
}
