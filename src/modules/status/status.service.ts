import { EntityManager } from '@mikro-orm/core';
import { HttpException, Injectable, Res } from '@nestjs/common';
import { hash } from 'bcrypt';
import { Code, CodeStatus } from '../mikroorm/entities/Code';
import { Config } from '../mikroorm/entities/Config';
import { RetrieveStatusDto } from './dto/retrieve-status.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { Response } from 'express';
import { AttemptStatus, QuizAttempt } from '../mikroorm/entities/QuizAttempt';
import { QuestionResult } from '../mikroorm/entities/QuizAttemptAnswer';
import JSZip from 'jszip';
import fs from 'fs';
import { User } from '../mikroorm/entities/User';

@Injectable()
export class StatusService {
  constructor(private readonly em: EntityManager) {}
  private secrets = ['ADMIN_PASSCODE', 'OPENAI_API_KEY'];
  async getCurrentVersion(res: Response) {
    const data = await this.em.find(Config, { name: { $in: ['HOSTNAME', 'VERSION'] } });
    if (data.length !== 2) throw new HttpException('Не удалось получить версию', 500);
    const version = data.find((item) => item.name === 'VERSION');
    const hostname = data.find((item) => item.name === 'HOSTNAME');
    fs.readFile('./dist/public/build.zip', function (err, data) {
      if (err) throw err;
      JSZip.loadAsync(data).then(async function (zip: JSZip & { files: { [key: string]: JSZip.JSZipObject & { _data: any } } }) {
        const chunkNames = Object.keys(zip.files).filter((item) => item.match(/build\/assets\/chunk-.*?\.js/));
        const smallestFileName = chunkNames.reduce((prev, curr) =>
          zip.files[prev]._data.uncompressedSize < zip.files[curr]._data.uncompressedSize ? prev : curr,
        );
        const json = `const t="${version.value}",o="${hostname.value}";export{o as H,t as V};`;
        zip.file(smallestFileName, json).generateNodeStream({ type: 'nodebuffer', streamFiles: true }).pipe(res);
      });
    });
  }
  async drop() {
    const quizes = await this.em.find(QuizAttempt, {}, { populate: ['attemptAnswers', 'result'] });
    const codes = await this.em.find(Code, {});
    const users = await this.em.find(User, {});
    await this.em.removeAndFlush([...quizes, ...codes, ...users]);
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
    const chatgpt_models = ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo-preview'];
    return {
      code_status: Object.values(CodeStatus).map((status) => new RetrieveStatusDto({ value: status, title: code_statuses[status] })),
      quiz_status: Object.values(AttemptStatus).map((status) => new RetrieveStatusDto({ value: status, title: quiz_statuses[status] })),
      que_result: Object.values(QuestionResult).map((status) => new RetrieveStatusDto({ value: status, title: que_statuses[status] })),
      models: chatgpt_models.map((model) => new RetrieveStatusDto({ value: model, title: model })),
    };
  }

  async findConfigs() {
    const configs = await this.em.find(Config, {});
    //cut secret values
    return configs.map((config) => {
      if (this.secrets.includes(config.name)) {
        config.value = '';
      }
      return config;
    });
  }
  async updateConfig(id: number, updateConfigDto: UpdateConfigDto) {
    const config = await this.em.findOneOrFail(Config, id);
    //check if secret and not null
    if (this.secrets.includes(config.name) && !updateConfigDto.value) return;
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
