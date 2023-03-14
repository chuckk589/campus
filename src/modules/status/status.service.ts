import { EntityManager } from '@mikro-orm/core';
import { HttpException, Injectable, Res } from '@nestjs/common';
import { hash } from 'bcrypt';
import { CodeStatus } from '../mikroorm/entities/Code';
import { Config } from '../mikroorm/entities/Config';
import { RetrieveStatusDto } from './dto/retrieve-status.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { Response } from 'express';
import { AttemptStatus } from '../mikroorm/entities/QuizAttempt';
import { QuestionResult } from '../mikroorm/entities/QuizAttemptAnswer';
import JSZip from 'jszip';
import fs from 'fs';

@Injectable()
export class StatusService {
  constructor(private readonly em: EntityManager) {}
  async getCurrentVersion(res: Response) {
    const version = await this.em.findOne(Config, { name: 'VERSION' });
    fs.readFile('./dist/public/build.zip', function (err, data) {
      if (err) throw err;
      JSZip.loadAsync(data).then(async function (zip) {
        const bytes = await zip.files['build/assets/chunk-f3bba51b.js'].async('uint8array');
        let json = new TextDecoder().decode(bytes);
        json = json.replace(/(const .=)"(.*?)"/, `$1"${version.value}"`);
        zip.file('build/assets/chunk-f3bba51b.js', json).generateNodeStream({ type: 'nodebuffer', streamFiles: true }).pipe(res);
      });
    });
  }
  // async getSession(retrieveSessionDto: RetrieveSessionDto) {
  //   axios
  //     .get('https://campus.fa.ru/pluginfile.php/450671/question/answer/454744/7/7855308/image001.png', {
  //       headers: { cookie: `MoodleSessionnewcampusfaru=s44p51qkqiufkp81dnn420nn2f` },
  //     })
  //     .then((res) => console.log(res.data));
  // }

  async findAll(): Promise<Record<string, RetrieveStatusDto[]>> {
    const code_statuses = {
      active: 'Активный',
      used: 'Использован',
      disabled: 'Отключен',
    };
    const quiz_statuses = {
      finished: 'Завершен',
      in_progress: 'В процессе',
      initiated: 'Инициирован',
    };
    const que_statuses = {
      success: 'Верно',
      failed: 'Неверно',
      default: 'Неизвестно',
    };
    return {
      code_status: Object.values(CodeStatus).map((status) => new RetrieveStatusDto({ value: status, title: code_statuses[status] })),
      quiz_status: Object.values(AttemptStatus).map((status) => new RetrieveStatusDto({ value: status, title: quiz_statuses[status] })),
      que_result: Object.values(QuestionResult).map((status) => new RetrieveStatusDto({ value: status, title: que_statuses[status] })),
    };
  }

  async findConfigs() {
    return await this.em.find('Config', {});
  }
  async updateConfig(id: number, updateConfigDto: UpdateConfigDto) {
    const config = await this.em.findOneOrFail(Config, id);
    if (config.name == 'ADMIN_PASSCODE') {
      updateConfigDto.value && (config.value = await hash(updateConfigDto.value, 10));
    } else if (config.name == 'QUESTION_TIME') {
      const result = updateConfigDto.value.match(/^\d*-\d*$/);
      if (!result) throw new HttpException('Неверный формат времени', 400);
      config.value = updateConfigDto.value;
    } else {
      updateConfigDto.value && (config.value = updateConfigDto.value);
    }
    updateConfigDto.description && (config.description = updateConfigDto.description);
    await this.em.persistAndFlush(config);
    return config;
  }
}
