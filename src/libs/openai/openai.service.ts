import { EntityManager } from '@mikro-orm/core';
import { HttpException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import OpenAI from 'openai';
import { ChatCompletionAssistantMessageParam } from 'openai/resources';
import { AppConfigService } from 'src/modules/app-config/app-config.service';
import { Config } from 'src/modules/mikroorm/entities/Config';
import { QuestionType } from 'src/types/interfaces';
import { HTMLCampusParser } from 'src/types/interfaces';

@Injectable()
export class OpenAiService {
  private readonly client: OpenAI;

  constructor(private readonly configService: AppConfigService, private readonly em: EntityManager, private eventEmitter: EventEmitter2) {
    const configuration = {
      apiKey: this.configService.get('OPENAI_API_KEY') || 'OPENAI_API_KEY',
    };

    this.client = new OpenAI(configuration);
    eventEmitter.on('config_updated', async (config: Config) => {
      if (config.name === 'OPENAI_API_KEY') {
        this.client.apiKey = config.value;
      }
    });
  }
  public async switchApiKey(apiKey: string) {
    this.client.apiKey = apiKey;
  }
  public async getAIResponse(html: string, question_type: QuestionType): Promise<string | number[]> {
    const currentModel = await this.em.find(Config, { name: { $in: ['OPENAI_MODEL', 'OPENAI_REPEATS'] } });
    if (currentModel.length !== 2) {
      throw new HttpException('Не найдены настройки OpenAI', 500);
    }
    const [model, repeats] = currentModel;
    const payload = HTMLCampusParser.parse_question_data(html, question_type);
    // const output = HTMLCampusParser.convert_to_gpt_payload(question_type, payload);
    // console.log(output);
    let supplyText = 'Реши задачу, решение расписывать не нужно\nУсловие:\n ' + payload.subject + '\n';
    if (question_type === 0 || question_type === 2) {
      supplyText += 'Варианты ответов:\n' + (payload as any).options.map((option: string) => '• ' + option).join('\n') + '\n';
      if (question_type === 0) {
        supplyText += 'Выбери все правильные ответы и верни их индексы в формате $index,$index,...  нумерация с 0';
      } else {
        supplyText += 'Дай ответ в формате $index, где index - индекс правильного ответа, нумерация с 0';
      }
    } else if (question_type === 1) {
      supplyText += 'Варианты ответов:\n';
      supplyText += (payload as any).variants
        .map(
          (variant: any) =>
            variant.text +
            ':\n' +
            variant.options
              .filter((variant: any) => variant != 'Выберите...')
              .map((variant: string) => '• ' + variant)
              .join('\n'),
        )
        .join('\n\n');
      supplyText += '\n\nВыбери по одному варианту для каждого вопроса и верни их индексы в формате $index,$index,...  нумерация с 0';
    } else {
      supplyText += 'Дай ответ в очень краткой форме, максимум 3 слова или цифры';
    }

    const result = await this.getResponseWithCtx(supplyText, 1, model.value);

    // return question_type == 3
    //   ? result[0]
    //   : result[0]
    //       .replaceAll(/\$/g, '')
    //       .split(',')
    //       .filter((el) => el.length > 0)
    //       .map((el) => {
    //         el.trim();
    //         return parseInt(el);
    //       });
    if (question_type == 3) {
      return result[0];
    } else if (question_type == 0 || question_type == 2) {
      return result[0]
        .replaceAll(/\$/g, '')
        .split(',')
        .filter((el) => el.length > 0)
        .map((el) => {
          el.trim();
          return parseInt(el);
        });
    } else if (question_type == 1) {
      //in case of select we need to increment index by 1 because we cut 'Выберите...' earlier
      return result[0]
        .replaceAll(/\$/g, '')
        .split(',')
        .filter((el) => el.length > 0)
        .map((el) => {
          el.trim();
          return parseInt(el) + 1;
        });
    }
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
