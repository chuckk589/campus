import { Entity, PrimaryKey, ManyToOne, Property, OneToOne } from '@mikro-orm/core';
import { CustomBaseEntity } from './CustomBaseEntity';
import { User } from './User';

@Entity()
export class UserRestriction extends CustomBaseEntity {
  @PrimaryKey()
  id!: number;

  @OneToOne(() => User, (user) => user.restriction, { orphanRemoval: true })
  user: User;

  @Property({ nullable: true })
  reason?: string;
}
