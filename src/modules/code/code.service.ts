import { Injectable } from '@nestjs/common';
import { Code } from '../mikroorm/entities/Code';
import { CreateCodeDto } from './dto/create-code.dto';
import crypto from 'crypto';
import { RetrieveCodeDto } from './dto/retrieve-code.dto';
import { UpdateCodeDto } from './dto/update-code.dto';
import { UserRestriction } from '../mikroorm/entities/UserRestriction';
import { EntityManager, wrap } from '@mikro-orm/core';
import { ReqUser } from 'src/types/interfaces';
import { Owner, OwnerRole } from '../mikroorm/entities/Owner';

@Injectable()
export class CodeService {
  constructor(private readonly em: EntityManager) {}

  async update(id: number, updateCodeDto: UpdateCodeDto) {
    const code = await this.em.findOne(Code, { id });
    if (code) {
      code.status = updateCodeDto.status;
      await this.em.persistAndFlush(code);
      return new RetrieveCodeDto(code);
    }
    return null;
  }

  //TODO: add owner permissions
  async remove(ids: number[]) {
    const codes = await this.em.find(Code, { id: { $in: ids }, attempt: { $eq: null } });
    codes.map((code) => this.em.remove(code));
    await this.em.flush();
    return codes.map((code) => code.id);
  }
  async create(user: ReqUser, createCodeDto: CreateCodeDto): Promise<RetrieveCodeDto[]> {
    const existingCodes = await this.em.find(Code, {});
    const newCodes = [];
    //limit the amount of codes to be created to max 30 , asked by the client
    const amount = +createCodeDto.amount > 30 ? 30 : +createCodeDto.amount;
    for (let i = 0; i < amount; ) {
      const value = crypto.randomBytes(8).toString('hex');
      if (!existingCodes.find((code) => code.value === value)) {
        newCodes.push(this.em.create(Code, { value: value.toUpperCase(), createdBy: this.em.getReference(Owner, user.id) }));
        i++;
      }
    }
    await this.em.flush();
    await this.em.populate(newCodes, ['createdBy']);
    return newCodes.map((code) => new RetrieveCodeDto(code));
  }

  async findAll(user: ReqUser) {
    //return all codes associated with owner who created them, or all codes if user is admin
    const codes = await this.em.find(
      Code,
      { ...(user.role == OwnerRole.ADMIN ? {} : { createdBy: { id: user.id } }) },
      { populate: ['attempt.user', 'createdBy'] },
    );
    const restrictions = await this.em.find(UserRestriction, {});
    return codes.map((code) => {
      const restriction = restrictions.find((restriction) => restriction.userId == code.attempt?.user?.userId);
      return new RetrieveCodeDto(code, restriction);
    });
  }
}
