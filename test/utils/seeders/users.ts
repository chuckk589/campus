import { MikroORM } from '@mikro-orm/core';

export default async function Seed(orm: MikroORM) {
  await orm.em.getConnection().execute(
    `INSERT INTO user (\`id\`, \`created_at\`, \`updated_at\`, \`user_id\`, \`login\`, \`name\`) VALUES
    (1,	'2024-01-08 21:07:21',	'2024-01-08 21:07:21',	'32838',	'220364',	'Нина Голованова'),
    (2,	'2024-01-08 21:07:21',	'2024-01-08 21:07:21',	'32839',	'220365',	'Антонина Лебедева');`,
  );
}
