import { HttpException, Inject, Injectable } from '@nestjs/common';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';
import { EntityManager, assign } from '@mikro-orm/core';
import { Owner, OwnerRole } from '../mikroorm/entities/Owner';
import { RetrieveOwnerDto } from './dto/retrieve-owner.dto';
import { REDIS_STORE } from 'src/constants';
import RedisStore from 'connect-redis';

@Injectable()
export class OwnerService {
  constructor(private readonly em: EntityManager, @Inject(REDIS_STORE) private readonly store: RedisStore) {}

  async create(createOwnerDto: CreateOwnerDto): Promise<RetrieveOwnerDto> {
    const owner = await this.em.getRepository(Owner).createIfNotExists({ ...createOwnerDto, role: createOwnerDto.role as OwnerRole });
    if (!owner) {
      throw new HttpException('User already exists', 400);
    }
    await this.em.persistAndFlush(owner);
    return new RetrieveOwnerDto(owner);
  }

  async findAll(): Promise<RetrieveOwnerDto[]> {
    const owners = await this.em.find(Owner, {}, { populate: ['permissions.permission'] });
    return owners.map((owner) => new RetrieveOwnerDto(owner));
  }

  async update(id: number, updateOwnerDto: UpdateOwnerDto): Promise<RetrieveOwnerDto> {
    const owner = await this.em.getRepository(Owner).updateOwner(id, updateOwnerDto, this.store);
    if (!owner) {
      throw new HttpException('User not found', 404);
    }
    await this.em.persistAndFlush(owner);
    return new RetrieveOwnerDto(owner);
  }

  async remove(ids: number[]): Promise<number[]> {
    const owners = await this.em.find(Owner, { id: { $in: ids } }, { populate: ['permissions'] });
    owners.map((owner) => this.em.remove(owner));
    await this.em.flush();
    await this.em.getRepository(Owner).clearSession(this.store, ids);
    return owners.map((owner) => owner.id);
  }
}
