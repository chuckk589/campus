import {
  Collection,
  Entity,
  EntityData,
  EntityRepository,
  EntityRepositoryType,
  Enum,
  OneToMany,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';
import { CustomBaseEntity } from './CustomBaseEntity';
import bcrypt from 'bcrypt';
import { UpdateOwnerDto } from 'src/modules/owner/dto/update-owner.dto';
import { ReqUser } from 'src/types/interfaces';
import RedisStore from 'connect-redis';
import { OwnerPermission } from './OwnerPermission';

export enum OwnerRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity({ repository: () => OwnerRepository })
export class Owner extends CustomBaseEntity {
  [EntityRepositoryType]?: OwnerRepository;

  @PrimaryKey()
  id!: number;

  @Enum({ items: () => OwnerRole, default: OwnerRole.USER })
  role!: OwnerRole;

  @Unique()
  @Property()
  username!: string;

  @Property()
  password!: string;

  @Property({ nullable: true })
  email!: string;

  @Property({ nullable: true })
  credentials: string;

  @OneToMany(() => OwnerPermission, (item) => item.owner, { orphanRemoval: true })
  permissions = new Collection<OwnerPermission>(this);
}

export class OwnerRepository extends EntityRepository<Owner> {
  async validateUser(username: string, password: string): Promise<Owner | null> {
    const user = await this.findOne({ username }, { populate: ['permissions.permission'], refresh: true });
    if (!user) {
      return null;
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return null;
    }
    return user;
  }

  async createIfNotExists(RequiredEntityData: EntityData<Owner> = {}): Promise<Owner> {
    const user = await this.findOne({ username: RequiredEntityData.username }, { populate: ['permissions.permission'] });
    if (user) {
      return null;
    }
    const hashedPassword = await bcrypt.hash(RequiredEntityData.password, 12);
    return this.create({
      ...RequiredEntityData,
      password: hashedPassword,
    });
  }
  async updateOwner(id: number, data: UpdateOwnerDto, store?: RedisStore): Promise<Owner> {
    const user = await this.findOne({ id }, { populate: ['permissions.permission'] });
    if (!user) {
      return null;
    }

    //sync permissions
    const _permissions = user.permissions.getItems();
    for (const permission of _permissions) {
      const found = data.permissions.find((id) => +id == permission.permission.id);
      if (!found) {
        user.permissions.remove(permission);
      }
    }
    for (const permission of data.permissions) {
      const found = _permissions.find((item) => item.permission.id == +permission);
      if (!found) {
        const newPermission = this.getEntityManager().create(OwnerPermission, { owner: user, permission: +permission });
        user.permissions.add(newPermission);
      }
    }

    if (data.password && data.password.length > 0) {
      data.password = await bcrypt.hash(data.password, 12);
    } else {
      delete data.password;
    }

    const { permissions, ...rest } = data;
    this.assign(user, { ...rest, role: data.role as OwnerRole });

    await this.clearSession(store, [id]);
    return user;
  }
  async clearSession(store: RedisStore, ids: number[]): Promise<void> {
    if (!store) return;
    await store.all(async (err, entries) => {
      if (err) {
        throw new Error('Error fetching entries');
      }
      for (const id of ids) {
        const user = entries.find((entry: { passport: { user: ReqUser } }) => entry.passport.user.id == id);
        if (!user) return;
        await store.destroy(user.id);
      }
    });
  }
}
