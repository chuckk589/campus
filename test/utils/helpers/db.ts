import { MikroORM } from '@mikro-orm/core';

export async function ClearDB(orm: MikroORM) {
  //drop all tables except configs
  await orm.getSchemaGenerator().clearDatabase();
  const configs = [
    {
      name: 'ADMIN_PASSCODE',
      value: '$2a$12$DC3oYahZU5pZIFbFMhminuEnlSPXb4coN8AfEOkRpcOTpefSXSdAu', //1
      category: 'secret',
    },
    {
      name: 'VERSION',
      value: '0.0.1',
      description: 'Текущая версия приложения',
    },
    {
      name: 'QUESTION_TIME',
      value: '4-10',
      description: 'Время на ответ на вопрос мин - макс, в секундах, через дефис',
    },
    {
      name: 'HOSTNAME',
      value: 'http://localhost:3000',
      description: 'Адрес сервера, используется при генерации расширения',
    },
    {
      name: 'OPENAI_API_KEY',
      value: 'OPENAI_API_KEY',
      description: 'Ключ OpenAI API',
      category: 'secret',
    },
    {
      name: 'OPENAI_MODEL',
      value: 'gpt-4-vision-preview',
      description: 'Модель OpenAI',
    },
    {
      name: 'OPENAI_REPEATS',
      value: '3',
      description: 'Количество повторений запроса к OpenAI',
    },
  ];
  for (const config of configs) {
    const entity = orm.em.create('Config', config);
    await orm.em.persistAndFlush(entity);
  }
}
