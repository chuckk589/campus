/* eslint "prettier/prettier": ['error', { printWidth: 100 }]*/
import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';

export class ConfigSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const values = [
      `("VERSION", "0.0.1", "Текущая версbия приложения", NULL)`,
      `("QUESTION_TIME", "4-10", "Время на ответ на вопрос мин - макс, в секундах, через дефис", NULL)`,
      `("HOSTNAME", "http://195.161.114.112:3000", "Адрес сервера, используется при генерации расширения", NULL)`,
      `("OPENAI_API_KEY", "OPENAI_API_KEY", "Ключ OpenAI API", "secret")`,
      `("OPENAI_MODEL", "gpt-4-vision-preview", "Модель OpenAI", NULL)`,
      `("OPENAI_REPEATS", "3", "Количество повторений запроса к OpenAI", NULL)`,
    ];
    await em
      .getConnection()
      .execute(
        `INSERT INTO config (name, value, description, category) VALUES ${values.join(
          ',',
        )} ON DUPLICATE KEY UPDATE name=name;`,
      );
    await em.getConnection().execute(
      `INSERT INTO permission (created_at, updated_at, name, display_name) VALUES 
        (now(), now(),'quiz_edit_own', 'Редактирование своих тестов'),
        (now(), now(),'quiz_view_state', 'Доступ к истории ответов')
        ON DUPLICATE KEY UPDATE name=name;`,
    );
    //password: 123
    await em
      .getConnection()
      .execute(
        `INSERT INTO owner (created_at, updated_at, role, username, password, email, credentials) VALUES (now(), now(), 2, 'superadmin', '$2a$12$tUh2oW4.kL8Vxsfm0Wp8J.t4/drRqAc0824e0sPltyGJ8dfI6kKx.', 'superadmin@admin.com', 'Vasya Pupkin') ON DUPLICATE KEY UPDATE username=username;`,
      );
  }
}
