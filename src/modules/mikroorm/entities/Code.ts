import { Collection, Entity, Enum, ManyToOne, OneToMany, OneToOne, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { QuizAttempt } from './QuizAttempt';
import { CustomBaseEntity } from './CustomBaseEntity';
import { Owner } from './Owner';

export enum CodeStatus {
  ACTIVE = 'active',
  DISABLED = 'disabled',
  USED = 'used',
}

@Entity()
export class Code extends CustomBaseEntity {
  @PrimaryKey()
  id!: number;

  @Unique()
  @Property()
  value!: string;

  @OneToOne({
    entity: () => QuizAttempt,
    mappedBy: 'code',
  })
  attempt: QuizAttempt;

  @Enum({ items: () => CodeStatus, default: CodeStatus.ACTIVE })
  status: CodeStatus;

  @ManyToOne({ entity: () => Owner, nullable: true })
  createdBy: Owner;
}
