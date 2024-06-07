import { MikroORM } from '@mikro-orm/core';
import MikroORMOptions from '../../../src/configs/mikro-orm.config';

const query1 = `INSERT INTO code (created_at, updated_at, value, status, created_by_id) VALUES (now(), now(), (SELECT LEFT(UUID(), 8)), 1, '20');`;
const query2 = `INSERT INTO quiz_attempt (created_at, updated_at, attempt_id, question_amount, attempt_status, cmid, path, user_id, code_id, parsing_state, is_proctoring) VALUES (now(), now(), md5(now()), '0', 3, md5(now()), NULL, '5', (SELECT LAST_INSERT_ID()), 4, '0')`;

(async function initDB() {
  const orm = await MikroORM.init(MikroORMOptions);
  const connection = orm.em.getConnection();
  for (let i = 0; i < 100; i++) {
    await connection.execute(query1);
    await connection.execute(query2);
  }
  await orm.close(true);
})();
