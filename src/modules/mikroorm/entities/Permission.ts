import { Entity, PrimaryKey, ManyToOne, Property, OneToOne, Unique } from '@mikro-orm/core';
import { CustomBaseEntity } from './CustomBaseEntity';
import { User } from './User';

@Entity()
export class Permission extends CustomBaseEntity {
  @PrimaryKey()
  id!: number;

  @Property()
  @Unique()
  name?: string;

  @Property()
  displayName?: string;
}
