import { Collection, Entity, ManyToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { CustomBaseEntity } from './CustomBaseEntity';
import { QuizAttempt } from './QuizAttempt';

@Entity()
export class QuizAnswer extends CustomBaseEntity {
  @PrimaryKey()
  id!: number;

  @Property({ nullable: true, type: 'text' })
  html?: string;

  @Property({ nullable: true, type: 'text', default: '{}' })
  jsonAnswer?: string;

  @Property({ nullable: true })
  question_hash?: string;

  @Property({ nullable: true })
  question_type?: number;
}
