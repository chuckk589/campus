import { Entity, ManyToOne, PrimaryKey, PrimaryKeyType, Property } from '@mikro-orm/core';
import { CustomBaseEntity } from './CustomBaseEntity';
import { QuizAnswer } from './QuizAnswer';
import { QuizAttempt } from './QuizAttempt';

@Entity()
export class QuizAttemptAnswer extends CustomBaseEntity {
  @Property()
  nativeId?: number;

  @ManyToOne(() => QuizAttempt, { primary: true })
  attempt: QuizAttempt;

  @ManyToOne(() => QuizAnswer, { primary: true })
  answer: QuizAnswer;

  [PrimaryKeyType]?: [number, number];
}
