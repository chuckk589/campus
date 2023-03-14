import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { HttpException } from '@nestjs/common/exceptions';
import { QuizAnswer } from '../mikroorm/entities/QuizAnswer';
import { RetrieveAnswerDto } from './dto/retrieve-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import JSZip from 'jszip';

@Injectable()
export class AnswersService {
  constructor(private readonly em: EntityManager) {}
  async create(file: Express.Multer.File) {
    const zip = new JSZip();
    const zipFile = await zip.loadAsync(file.buffer);
    const result = {
      success: 0,
      errored: 0,
      updated: 0,
    };
    const answers = await this.em.find(QuizAnswer, {});
    for (const file in zipFile.files) {
      try {
        const hashString = file.match(/question-(-*\d*)\/answer.json/);
        if (!hashString) continue;
        const hash = hashString[1];
        const bytes = await zipFile.files[file].async('uint8array');
        const json = new TextDecoder('utf-16le').decode(bytes);
        JSON.parse(json); // check if json is valid
        const existing = answers.find((answer) => answer.question_hash === hash);
        if (!existing) {
          const answer = new QuizAnswer();
          answer.jsonAnswer = json;
          answer.question_hash = hash;
          result.success++;
          answers.push(answer);
        } else {
          existing.jsonAnswer = json;
          result.updated++;
        }
      } catch (error) {
        result.errored++;
      }
    }
    await this.em.persistAndFlush(answers);
    return { result, updates: answers.map((answer) => new RetrieveAnswerDto(answer)) };
  }
  async findAll() {
    const answers = await this.em.find(QuizAnswer, {});
    return answers.map((answer) => new RetrieveAnswerDto(answer));
  }

  async update(id: number, updateAnswerDto: UpdateAnswerDto) {
    try {
      JSON.parse(updateAnswerDto.json);
      const answer = await this.em.findOneOrFail(QuizAnswer, id);
      answer.jsonAnswer = updateAnswerDto.json;
      await this.em.persistAndFlush(answer);
      return new RetrieveAnswerDto(answer);
    } catch (error) {
      throw new HttpException('Invalid JSON', 400);
    }
  }
}
