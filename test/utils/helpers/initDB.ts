import { MikroORM } from '@mikro-orm/core';
import MikroORMOptions from '../mikro-orm.test.config';
import { ClearDB } from './db';

export async function initDB() {
  const orm = await MikroORM.init(MikroORMOptions);
  await orm.getSchemaGenerator().dropSchema();
  await orm.getSchemaGenerator().createSchema();
  await orm.em.getConnection().execute(`SET GLOBAL FOREIGN_KEY_CHECKS=0`);
  await ClearDB(orm);
  await orm.close(true);
}
