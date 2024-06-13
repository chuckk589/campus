import { Entity, PrimaryKey, ManyToOne, Property, OneToOne } from '@mikro-orm/core';
import { CustomBaseEntity } from './CustomBaseEntity';
import { User } from './User';
import { Owner } from './Owner';
import { Permission } from './Permission';

@Entity()
export class OwnerPermission extends CustomBaseEntity {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => Owner)
  owner!: Owner;

  @ManyToOne(() => Permission)
  permission!: Permission;

  @Property({ nullable: true })
  metadata?: string;
}
