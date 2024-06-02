import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { CustomBaseEntity } from './CustomBaseEntity';
import { Owner } from './Owner';

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
}
