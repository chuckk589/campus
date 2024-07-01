import { BeforeUpdate, Entity, Enum, FlushEventArgs, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { CustomBaseEntity } from './CustomBaseEntity';
import { Owner } from './Owner';
import { QuizAnswer } from './QuizAnswer';

export enum QuestionState {
  CORRECT = 'correct',
  INCORRECT = 'incorrect',
  DEFAULT = 'default',
}

@Entity()
export class QuizAnswerState extends CustomBaseEntity {
  @PrimaryKey()
  id!: number;

  @Property({ nullable: true, type: 'text' })
  jsonAnswer?: string;

  @ManyToOne({ entity: () => QuizAnswer })
  quizAnswer?: QuizAnswer;

  @Enum({ items: () => QuestionState, default: QuestionState.INCORRECT })
  state!: QuestionState;
}
