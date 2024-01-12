import { Entity, PrimaryKey, ManyToOne, Property, OneToOne } from '@mikro-orm/core';
import { CustomBaseEntity } from './CustomBaseEntity';
import { User } from './User';

@Entity()
export class UserRestriction extends CustomBaseEntity {
  @PrimaryKey()
  id!: number;

  @Property({ nullable: true })
  reason?: string;

  @Property({ nullable: true })
  login?: string;

  @Property({ nullable: true })
  name?: string;

  @Property({ nullable: true })
  userId?: string;
}
