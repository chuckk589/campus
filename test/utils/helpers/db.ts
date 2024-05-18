import { MikroORM } from '@mikro-orm/core';

export async function ClearDB(orm: MikroORM) {
  //drop all tables except configs
  await orm.getSchemaGenerator().clearDatabase();
  const values = [
    `("ADMIN_PASSCODE", "$2a$12$DC3oYahZU5pZIFbFMhminuEnlSPXb4coN8AfEOkRpcOTpefSXSdAu", "Пароль администратора", "secret")`,
    `("VERSION", "0.0.1", "Текущая версbия приложения", NULL)`,
    `("QUESTION_TIME", "4-10", "Время на ответ на вопрос мин - макс, в секундах, через дефис", NULL)`,
    `("HOSTNAME", "http://195.161.114.112:3000", "Адрес сервера, используется при генерации расширения", NULL)`,
    `("OPENAI_API_KEY", "OPENAI_API_KEY", "Ключ OpenAI API", "secret")`,
    `("OPENAI_MODEL", "gpt-4-vision-preview", "Модель OpenAI", NULL)`,
    `("OPENAI_REPEATS", "3", "Количество повторений запроса к OpenAI", NULL)`,
  ];
  await orm.em
    .getConnection()
    .execute(`INSERT INTO config (name, value, description, category) VALUES ${values.join(',')} ON DUPLICATE KEY UPDATE name=name`);
}
