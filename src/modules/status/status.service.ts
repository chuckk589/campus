import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { hash } from 'bcrypt';
import { CodeStatus } from '../mikroorm/entities/Code';
import { Config } from '../mikroorm/entities/Config';
import { RetrieveStatusDto } from './dto/retrieve-status.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import axios from 'axios';
import { RetrieveSessionDto } from './dto/retrieve-session.dto';
import { JSDOM } from 'jsdom';

@Injectable()
export class StatusService {
  constructor(private readonly em: EntityManager) {}

  async getSession(retrieveSessionDto: RetrieveSessionDto) {
    axios
      .get('https://campus.fa.ru/pluginfile.php/450671/question/answer/454744/7/7855308/image001.png', {
        headers: { cookie: `MoodleSessionnewcampusfaru=s44p51qkqiufkp81dnn420nn2f` },
      })
      .then((res) => console.log(res.data));
  }

  async findAll(): Promise<Record<string, RetrieveStatusDto[]>> {
    const code_statuses = {
      active: 'Активный',
      used: 'Использован',
      disabled: 'Отключен',
    };
    return {
      code_status: Object.values(CodeStatus).map((status) => new RetrieveStatusDto({ value: status, title: code_statuses[status] })),
    };
  }

  async findConfigs() {
    return await this.em.find('Config', {});
  }
  async updateConfig(id: number, updateConfigDto: UpdateConfigDto) {
    const config = await this.em.findOneOrFail(Config, id);
    if (config.name == 'ADMIN_PASSCODE') {
      updateConfigDto.value && (config.value = await hash(updateConfigDto.value, 10));
    } else {
      updateConfigDto.value && (config.value = updateConfigDto.value);
    }
    updateConfigDto.category && (config.category = updateConfigDto.category);
    updateConfigDto.description && (config.description = updateConfigDto.description);
    await this.em.persistAndFlush(config);
    return config;
  }
}
