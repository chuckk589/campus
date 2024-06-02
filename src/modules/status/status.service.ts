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
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import * as crypto from 'crypto';
import { OwnerRole } from '../mikroorm/entities/Owner';

@Injectable()
export class StatusService {
  constructor(private readonly em: EntityManager, private eventEmitter: EventEmitter2) {}

  private secrets = ['ADMIN_PASSCODE', 'OPENAI_API_KEY'];

  // @OnEvent('config_updated')
  // handleConfigUpdatedEvent(config: Config) {
  //   if (config.name === 'VERSION') {
  //     fs.readFile('./dist/public/build.zip', (err, data) => {
  //       if (err) throw err;
  //       JSZip.loadAsync(data)
  //         .then(async (zip: JSZip & { files: { [key: string]: JSZip.JSZipObject & { _data: any } } }) => {
  //           const hash = crypto.createHash('sha256');

  //           for (const filename of Object.keys(zip.files)) {
  //             hash.update((await zip.files[filename].async('nodebuffer')).toString('base64'));
  //           }
  //           const hashValue = hash.digest('hex');
  //           const config = await this.em.findOne(Config, { name: 'EXTENSION_HASH' });
  //           if (config) {
  //             config.value = hashValue;
  //             await this.em.persistAndFlush(config);
  //           } else {
  //             const newConfig = this.em.create(Config, { name: 'EXTENSION_HASH', value: hashValue });
  //             await this.em.persistAndFlush(newConfig);
  //           }
  //         })
  //         .catch((err) => {
  //           console.error(err);
  //         });
  //     });
  //   }
  // }

  async getCurrentVersion(res: Response) {
    const data = await this.em.find(Config, { name: { $in: ['HOSTNAME', 'VERSION'] } });
    if (data.length !== 2) throw new HttpException('Не удалось получить версию', 500);
    const version = data.find((item) => item.name === 'VERSION');
    const hostname = data.find((item) => item.name === 'HOSTNAME');
    fs.readFile('./dist/public/build.zip', function (err, data) {
      if (err) throw err;
      JSZip.loadAsync(data).then(async function (zip: JSZip & { files: { [key: string]: JSZip.JSZipObject & { _data: any } } }) {
        const cnstFileName = Object.keys(zip.files).find((filename) => filename.match(/.*constants\.js/));
        const json = `const t="${version.value}",o="${hostname.value}";export{o as H,t as V};`;
        zip.file(cnstFileName, json).generateNodeStream({ type: 'nodebuffer', streamFiles: true }).pipe(res);
      });
    });
  }

  async drop() {
    const quizes = await this.em.find(QuizAttempt, {}, { populate: ['attemptAnswers', 'result'] });
    const codes = await this.em.find(Code, {});
    const users = await this.em.find(User, {});
    await this.em.removeAndFlush([...quizes, ...codes, ...users]);
  }

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
    const owner_roles = {
      admin: 'Администратор',
      user: 'Пользователь',
    };
    const chatgpt_models = ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo-preview', 'gpt-4-vision-preview'];
    return {
      owner_role: Object.values(OwnerRole).map((role) => new RetrieveStatusDto({ value: role, title: owner_roles[role] })),
      code_status: Object.values(CodeStatus).map((status) => new RetrieveStatusDto({ value: status, title: code_statuses[status] })),
      quiz_status: Object.values(AttemptStatus).map((status) => new RetrieveStatusDto({ value: status, title: quiz_statuses[status] })),
      que_result: Object.values(QuestionResult).map((status) => new RetrieveStatusDto({ value: status, title: que_statuses[status] })),
      models: chatgpt_models.map((model) => new RetrieveStatusDto({ value: model, title: model })),
    };
  }

  async findConfigs() {
    const configs = await this.em.find(Config, {});
    //cut secret values
    //FIXME: move to interceptor
    return configs.map((config) => {
      if (this.secrets.includes(config.name)) {
        config.value = '';
      }
      return config;
    });
  }
  async updateConfig(id: number, updateConfigDto: UpdateConfigDto) {
    const config = await this.em.getRepository(Config).safeUpdate(id, updateConfigDto);
    if (!config) return;
    await this.em.persistAndFlush(config);
    this.eventEmitter.emit('config_updated', config);
    return config;
  }
}
