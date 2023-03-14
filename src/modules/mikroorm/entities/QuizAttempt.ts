import { Collection, Entity, Enum, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Code } from './Code';
import { CustomBaseEntity } from './CustomBaseEntity';
import { QuizAnswer } from './QuizAnswer';
import { QuizAttemptAnswer } from './QuizAttemptAnswer';
import { QuizResult } from './QuizResult';
import { User } from './User';
// import { compare, hash } from 'bcrypt';
export enum AttemptStatus {
  FINISHED = 'finished',
  IN_PROGRESS = 'in_progress',
  INITIATED = 'initiated',
}

@Entity()
export class QuizAttempt extends CustomBaseEntity {
  @PrimaryKey()
  id!: number;

  @Property({ nullable: true })
  attemptId?: string;

  @Property({ default: 0 })
  questionAmount?: number;

  @Enum({ items: () => AttemptStatus, default: AttemptStatus.INITIATED })
  attemptStatus!: AttemptStatus;

  @Property({ nullable: true })
  cmid?: string;

  @ManyToOne({ entity: () => User })
  user?: User;

  @OneToOne({ entity: () => Code })
  code?: Code;

  @OneToMany(() => QuizAttemptAnswer, (item) => item.attempt, { orphanRemoval: true })
  attemptAnswers = new Collection<QuizAttemptAnswer>(this);

  @OneToOne({
    entity: () => QuizResult,
    mappedBy: 'attempt',
    orphanRemoval: true,
  })
  result?: QuizResult;
}
