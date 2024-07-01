import { BeforeUpdate, Collection, Entity, Enum, FlushEventArgs, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { CustomBaseEntity } from './CustomBaseEntity';
import { Owner } from './Owner';
import { QuizAnswerState } from './QuizAnswerState';

export enum QuestionState {
  CORRECT = 'correct',
  INCORRECT = 'incorrect',
  DEFAULT = 'default',
}

@Entity()
export class QuizAnswer extends CustomBaseEntity {
  @PrimaryKey()
  id!: number;

  @Property({ nullable: true, type: 'text' })
  html?: string;

  @Property({ nullable: true, type: 'text' })
  jsonAnswer?: string;

  @Property({ nullable: true })
  question_hash?: string;

  @Property({ nullable: true })
  question_type?: number;

  @ManyToOne({ entity: () => Owner, nullable: true })
  updatedBy?: Owner;

  @Enum({ items: () => QuestionState, default: QuestionState.DEFAULT })
  state!: QuestionState;

  @OneToMany(() => QuizAnswerState, (item) => item.quizAnswer, { orphanRemoval: true })
  quizStates = new Collection<QuizAnswerState>(this);
}
