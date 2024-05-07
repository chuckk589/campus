import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Config } from '../entities/Config';

export class ConfigSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    em.getConnection().execute('SET FOREIGN_KEY_CHECKS=0;');
    em.create(Config, {
      name: 'ADMIN_PASSCODE',
      value: '$2a$12$DC3oYahZU5pZIFbFMhminuEnlSPXb4coN8AfEOkRpcOTpefSXSdAu', //1
      description: 'Пароль администратора',
      category: 'secret',
    });
    em.create(Config, {
      name: 'VERSION',
      value: '0.0.1',
      description: 'Текущая версия приложения',
    });
    em.create(Config, {
      name: 'QUESTION_TIME',
      value: '4-10',
      description: 'Время на ответ на вопрос мин - макс, в секундах, через дефис',
    });
    em.create(Config, {
      name: 'HOSTNAME',
      value: 'http://195.161.114.112:3000',
      description: 'Адрес сервера, используется при генерации расширения',
    });
    em.create(Config, {
      name: 'OPENAI_API_KEY',
      value: 'OPENAI_API_KEY',
      description: 'Ключ OpenAI API',
      category: 'secret',
    });
    em.create(Config, {
      name: 'OPENAI_MODEL',
      value: 'gpt-4-vision-preview',
      description: 'Модель OpenAI',
    });
    em.create(Config, {
      name: 'OPENAI_REPEATS',
      value: '3',
      description: 'Количество повторений запроса к OpenAI',
    });
  }
}
