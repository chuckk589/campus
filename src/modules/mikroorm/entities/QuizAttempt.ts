import { Collection, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { Code } from './Code';
import { CustomBaseEntity } from './CustomBaseEntity';
import { QuizAnswer } from './QuizAnswer';
import { QuizAttemptAnswer } from './QuizAttemptAnswer';
import { User } from './User';
// import { compare, hash } from 'bcrypt';

@Entity()
export class QuizAttempt extends CustomBaseEntity {
  @PrimaryKey()
  id!: number;

  @Property({ nullable: true })
  attemptId?: string;

  @Property({ default: 0 })
  questionAmount?: number;

  @Property({ nullable: true })
  cmid?: string;

  @Property({ nullable: true })
  time?: string;

  @ManyToOne({ entity: () => User })
  user?: User;

  @ManyToOne({ entity: () => Code })
  code?: Code;

  @OneToMany(() => QuizAttemptAnswer, (item) => item.attempt)
  attemptAnswers = new Collection<QuizAttemptAnswer>(this);
}
