import { MikroORM } from '@mikro-orm/core';
import MikroORMOptions from '../mikro-orm.test.config';

export async function initDB() {
  const orm = await MikroORM.init(MikroORMOptions);
  await orm.getSchemaGenerator().dropSchema();
  await orm.getSchemaGenerator().createSchema();
  await orm.close(true);
}
