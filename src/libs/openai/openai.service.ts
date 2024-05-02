import { EntityManager } from '@mikro-orm/core';
import { HttpException, Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { ChatCompletionAssistantMessageParam } from 'openai/resources';
import { AppConfigService } from 'src/modules/app-config/app-config.service';
import { Config } from 'src/modules/mikroorm/entities/Config';
import { QuestionType } from 'src/types/interfaces';
import { HTMLCampusParser } from 'src/types/interfaces';

@Injectable()
export class OpenAiService {
  private readonly client: OpenAI;

  constructor(private readonly configService: AppConfigService, private readonly em: EntityManager) {
    const configuration = {
      apiKey: this.configService.get('OPENAI_API_KEY'),
    };

    this.client = new OpenAI(configuration);
  }

  public async getAIResponse(html: string, question_type: QuestionType): Promise<string> {
    const currentModel = await this.em.find(Config, { name: { $in: ['OPENAI_MODEL', 'OPENAI_REPEATS'] } });
    if (currentModel.length !== 2) {
      throw new HttpException('Не найдены настройки OpenAI', 500);
    }
    const [model, repeats] = currentModel;
    const output = HTMLCampusParser.extract_text(html, question_type);
    console.log({
      subject: output,
      question_type,
    });
    return '';
    const supplyTexts = [
      'Выбери один или несколько правильных вариантов и верни их индексы через запятую',
      'Выбери по одному варианту для каждого вопроса и верни их индексы через запятую',
      'Реши задачу и дай ответ индексом без решения',
      'Реши задачу и верни ответ одним словом или цифрой без решения',
    ];

    const result = await this.getResponseWithCtx(supplyTexts[question_type] + '\n' + output, +repeats.value, model.value);
    //return most common response
    // console.log(output + '\n' + supplyTexts[question_type], result);
    const counts = result.reduce((acc, val) => acc.set(val, 1 + (acc.get(val) || 0)), new Map<string, number>());
    const max = [...counts.entries()].reduce((a, e) => (e[1] > a[1] ? e : a));
    return max[0];
  }
  private async getResponseWithCtx(subject: string, repeats: number, model: string, prev: string[] = []): Promise<string[]> {
    if (repeats <= 0) {
      return prev;
    } else {
      const response = await this.client.chat.completions
        .create({
          messages: prev
            .map((message) => [
              { role: 'user', content: subject },
              { role: 'assistant', content: message },
            ])
            .flat()
            .concat([{ role: 'user', content: subject }]) as ChatCompletionAssistantMessageParam[],
          model,
        })
        .catch((error) => {
          throw new HttpException(error.message, 500);
        });
      return this.getResponseWithCtx(subject, repeats - 1, model, [...prev, response.choices[0].message.content]);
    }
  }
}
