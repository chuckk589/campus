import { MikroORM } from '@mikro-orm/core';

export default async function Seed(orm: MikroORM) {
  await orm.em.getConnection()
    .execute(`INSERT INTO quiz_attempt_answer (\`id\`, \`created_at\`, \`updated_at\`, \`native_id\`, \`answered\`, \`final_result\`, \`attempt_id\`, \`answer_id\`) VALUES
  (1,	'2024-05-13 19:03:20',	'2024-05-13 19:03:20',	0,	0,	'default',	1,	1),
  (2,	'2024-05-13 19:03:20',	'2024-05-13 19:03:20',	1,	0,	'default',	1,	2),
  (3,	'2024-05-13 19:03:21',	'2024-05-13 19:03:21',	2,	0,	'default',	1,	3),
  (4,	'2024-05-13 19:03:21',	'2024-05-13 19:03:21',	3,	0,	'default',	1,	4);`);
}
