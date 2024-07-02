import { MikroORM } from '@mikro-orm/core';
import MikroORMOptions from '../mikro-orm.test.config';
import fs from 'fs';
export async function initDB(orm?: any) {
  const _orm = orm || (await MikroORM.init(MikroORMOptions));
  await _orm.getSchemaGenerator().dropSchema();
  await _orm.getSchemaGenerator().createSchema();
  // await orm.em.getConnection().execute(`SET GLOBAL FOREIGN_KEY_CHECKS=0`);
  //open sql and execute
  await _orm.getSchemaGenerator().clearDatabase();
  const sql = fs.readFileSync('./test/utils/seeders/campus.sql', 'utf-8');
  //split by separate sql statements
  const sqlStatements = sql.split(';\n');
  for (let i = 0; i < sqlStatements.length; i++) {
    if (sqlStatements[i].trim() !== '') {
      await _orm.em.getConnection().execute(sqlStatements[i]);
    }
  }
  if (!orm) {
    await _orm.close(true);
  }
}
