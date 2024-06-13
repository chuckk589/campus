import { Entity, PrimaryKey, ManyToOne, Property, OneToOne } from '@mikro-orm/core';
import { CustomBaseEntity } from './CustomBaseEntity';
import { User } from './User';

@Entity()
export class Permission extends CustomBaseEntity {
  @PrimaryKey()
  id!: number;

  @Property()
  name?: string;

  @Property()
  displayName?: string;
}
