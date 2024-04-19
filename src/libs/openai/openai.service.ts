import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { QuestionType } from 'src/types/interfaces';
import { HTMLCampusParser } from 'src/types/interfaces';

@Injectable()
export class OpenAiService {
  private readonly client: OpenAI;

  //   public imageService: OpenAiImageService;
  //   public searchService: OpenAiSearchService;
  //   public completionService: OpenAiCompletionService;

  constructor(private readonly configService: ConfigService) {
    const configuration = {
      apiKey: this.configService.get('OPENAI_API_KEY'),
    };

    this.client = new OpenAI(configuration);

    // const openai = new OpenAI();

    // this.client.chat.completions
    //   .create({
    //     messages: [{ role: 'system', content: 'You are a helpful assistant.' }],
    //     model: 'gpt-3.5-turbo',
    //   })
    //   .then((response) => {
    //     console.log(response);
    //   });
    //<h4 class=\"accesshide\">Текст вопроса</h4><input type=\"hidden\" name=\"q848480:7_:sequencecheck\" value=\"1\"><div class=\"qtext\"><p>Соответствие между видом чисел и их количеством:</p><p>Даны цифры 0, 1, 2, 3, 4, 5, 6, 7, 8, 9. Тогда:</p></div><div class=\"ablock\"><table class=\"answer\"><tbody><tr class=\"r0\"><td class=\"text\"><p>количество трёхзначных чисел, которые делятся на 10 и используют\nв записи все различные цифры, равно</p></td><td class=\"control\"><label class=\"accesshide\" for=\"menuq848480:7_sub0\">Ответ 1</label><select class=\"select custom-select custom-select ml-1\" id=\"menuq848480:7_sub0\" name=\"q848480:7_sub0\"><option selected=\"selected\" value=\"0\">Выберите...</option><option value=\"1\">400</option><option value=\"2\">72</option><option value=\"3\">1000</option><option value=\"4\">360</option><option value=\"5\">9000</option></select> </td></tr><tr class=\"r1\"><td class=\"text\"><p>количество всех четырёхзначных чисел, которые делятся на 10,\nравно</p></td><td class=\"control\"><label class=\"accesshide\" for=\"menuq848480:7_sub1\">Ответ 2</label><select class=\"select custom-select custom-select ml-1\" id=\"menuq848480:7_sub1\" name=\"q848480:7_sub1\"><option selected=\"selected\" value=\"0\">Выберите...</option><option value=\"1\">400</option><option value=\"2\">72</option><option value=\"3\">1000</option><option value=\"4\">360</option><option value=\"5\">9000</option></select> </td></tr><tr class=\"r0\"><td class=\"text\"><p>количество всех возможных четырёхзначных чисел равно</p></td><td class=\"control\"><label class=\"accesshide\" for=\"menuq848480:7_sub2\">Ответ 3</label><select class=\"select custom-select custom-select ml-1\" id=\"menuq848480:7_sub2\" name=\"q848480:7_sub2\"><option selected=\"selected\" value=\"0\">Выберите...</option><option value=\"1\">400</option><option value=\"2\">72</option><option value=\"3\">1000</option><option value=\"4\">360</option><option value=\"5\">9000</option></select> </td></tr><tr class=\"r1\"><td class=\"text\"><p>количество нечётных трёхзначных чисел, все цифры в записи которых\nразличны, равно</p></td><td class=\"control\"><label class=\"accesshide\" for=\"menuq848480:7_sub3\">Ответ 4</label><select class=\"select custom-select custom-select ml-1\" id=\"menuq848480:7_sub3\" name=\"q848480:7_sub3\"><option selected=\"selected\" value=\"0\">Выберите...</option><option value=\"1\">400</option><option value=\"2\">72</option><option value=\"3\">1000</option><option value=\"4\">360</option><option value=\"5\">9000</option></select> </td></tr></tbody></table></div>
  }

  public async getAIResponse(html: string, question_type: QuestionType): Promise<string> {
    const output = HTMLCampusParser.extract_text(html, question_type);
    const supplyTexts = [
      'Выбери один или несколько правильных вариантов и верни их индексы через запятую',
      'Выбери по одному варианту для каждого вопроса и верни их индексы через запятую',
      'Выбери единственный правильный вариант ответа и верни его номер',
      'Дай ответ одним предложением',
    ];
    const response = await this.client.chat.completions.create({
      messages: [{ role: 'user', content: supplyTexts[question_type] + '\n' + output }],
      model: 'gpt-3.5-turbo',
    });
    // console.log(response.choices[0].message);
    return response.choices[0].message.content;
  }
}
