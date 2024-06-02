import { Entity, EntityData, EntityRepository, EntityRepositoryType, Enum, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { CustomBaseEntity } from './CustomBaseEntity';
import bcrypt from 'bcrypt';
import { UpdateOwnerDto } from 'src/modules/owner/dto/update-owner.dto';

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
}

export class OwnerRepository extends EntityRepository<Owner> {
  async validateUser(username: string, password: string): Promise<Owner | null> {
    const user = await this.findOne({ username });
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
    const user = await this.findOne({ username: RequiredEntityData.username });
    if (user) {
      return null;
    }
    const hashedPassword = await bcrypt.hash(RequiredEntityData.password, 12);
    return this.create({
      ...RequiredEntityData,
      password: hashedPassword,
    });
  }
  async updateOwner(id: number, data: UpdateOwnerDto): Promise<Owner> {
    const user = await this.findOne({ id });
    if (!user) {
      return null;
    }

    if (data.password && data.password.length > 0) {
      data.password = await bcrypt.hash(data.password, 12);
    } else {
      delete data.password;
    }
    this.assign(user, { ...data, role: data.role as OwnerRole });
    return user;
  }
}
