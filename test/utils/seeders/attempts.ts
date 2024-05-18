import { MikroORM } from '@mikro-orm/core';

export default async function Seed(orm: MikroORM) {
  await orm.em.getConnection().execute(
    `INSERT INTO quiz_attempt (\`id\`, \`created_at\`, \`updated_at\`, \`attempt_id\`, \`question_amount\`, \`attempt_status\`, \`cmid\`, \`path\`, \`user_id\`, \`code_id\`, \`parsing_state\`) VALUES
    (1,	'2024-05-13 17:17:28',	'2024-05-13 19:03:18',	'1422534',	40,	'in_progress',	'483595',	'chunk1;chunk2;chunk3',	1,	1,	'default'),
    (2,	'2024-05-13 17:17:28',	'2024-05-13 19:03:18',	'1422534',	40,	'in_progress',	'483595',	'chunk1;chunk2;chunk3',	2,	2,	'in_progress'),
    (4,	'2024-05-17 00:51:19',	'2024-05-17 00:51:35',	NULL,	0,	'initiated',	'186319',	'',	1,	3,	'default');`,
  );
}
