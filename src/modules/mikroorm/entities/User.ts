import { Collection, Entity, EntityRepository, OneToMany, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { QuizAttempt } from './QuizAttempt';
import { CustomBaseEntity } from './CustomBaseEntity';

@Entity()
export class User extends CustomBaseEntity {
  @PrimaryKey()
  id!: number;

  @Unique()
  @Property({ nullable: true })
  userId?: string;

  @Unique()
  @Property({ nullable: true })
  login?: string;

  @Property({ nullable: true })
  name?: string;

  @OneToMany(() => QuizAttempt, (attempt) => attempt.user)
  attempts = new Collection<QuizAttempt>(this);
}
