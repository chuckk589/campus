import { EntityManager } from '@mikro-orm/mysql';
import { Injectable } from '@nestjs/common';
import { Code } from '../mikroorm/entities/Code';
import { CreateCodeDto } from './dto/create-code.dto';
import crypto from 'crypto';
import { RetrieveCodeDto } from './dto/retrieve-code.dto';
import { UpdateCodeDto } from './dto/update-code.dto';

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

  async remove(ids: number[]) {
    const codes = await this.em.find(Code, { id: { $in: ids }, attempt: { $eq: null } });
    codes.map((code) => this.em.remove(code));
    await this.em.flush();
    return codes.map((code) => code.id);
  }
  async create(createCodeDto: CreateCodeDto): Promise<RetrieveCodeDto[]> {
    const existingCodes = await this.em.find(Code, {});
    const newCodes = [];
    for (let i = 0; i < +createCodeDto.amount; ) {
      const value = crypto.randomBytes(8).toString('hex');
      if (!existingCodes.find((code) => code.value === value)) {
        newCodes.push(this.em.create(Code, { value: value.toUpperCase() }));
        i++;
      }
    }
    await this.em.persistAndFlush(newCodes);
    return newCodes.map((code) => new RetrieveCodeDto(code));
  }

  async findAll(): Promise<RetrieveCodeDto[]> {
    const codes = await this.em.find(Code, {}, { populate: ['attempt.user'] });
    return codes.map((code) => new RetrieveCodeDto(code));
  }
}
