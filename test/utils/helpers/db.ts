import { MikroORM } from '@mikro-orm/core';

export async function ClearDB(orm: MikroORM) {
  //drop all tables except configs
  const dropTables = await orm.getSchemaGenerator().getDropSchemaSQL();
  //remove config table from dropTables
  await orm.em.getConnection().execute(dropTables.replace(/drop table if exists `config`;/g, ''));
}
