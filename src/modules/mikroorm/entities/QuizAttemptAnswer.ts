import { Entity, Enum, ManyToOne, PrimaryKey, PrimaryKeyType, Property } from '@mikro-orm/core';
import { CustomBaseEntity } from './CustomBaseEntity';
import { QuizAnswer } from './QuizAnswer';
import { QuizAttempt } from './QuizAttempt';

@Entity()
export class QuizAttemptAnswer extends CustomBaseEntity {
  @PrimaryKey()
  id!: number;

  @Property()
  nativeId?: number;

  @Property({ default: false })
  answered?: boolean;

  // @Enum({ items: () => QuestionState, default: QuestionState.DEFAULT })
  // finalResult!: QuestionState;

  @ManyToOne(() => QuizAttempt)
  attempt: QuizAttempt;

  @ManyToOne(() => QuizAnswer)
  answer: QuizAnswer;
}
