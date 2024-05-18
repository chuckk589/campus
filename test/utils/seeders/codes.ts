import { MikroORM } from '@mikro-orm/core';

export default async function Seed(orm: MikroORM) {
  await orm.em.getConnection().execute(
    `INSERT INTO code (\`id\`, \`created_at\`, \`updated_at\`, \`value\`, \`status\`) VALUES
    (1,	'2024-01-08 21:05:05',	'2024-01-08 21:05:08',	'7ED9792443470B2D',	'used'),
    (2,	'2024-01-08 21:05:05',	'2024-01-08 21:07:11',	'8F24B5EDE0A1A2AB',	'used'),
    (3,	'2024-01-08 21:05:05',	'2024-01-08 21:08:10',	'2757CF30F136932C',	'active'),
    (4,	'2024-01-08 21:05:05',	'2024-01-08 21:09:09',	'F1D3D2EA1D1D2D3D',	'used'),
    (5,	'2024-01-08 21:05:05',	'2024-01-08 21:10:08',	'F1D3D2EA1D1D2D3E',	'active');`,
  );
}
