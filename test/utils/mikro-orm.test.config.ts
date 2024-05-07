import { MikroOrmModuleOptions } from '@mikro-orm/nestjs';
import 'dotenv/config';

const MikroORMOptions: MikroOrmModuleOptions = {
  type: 'mysql',
  allowGlobalContext: true,
  entities: ['./dist/modules/mikroorm/entities/'],
  entitiesTs: ['./src/modules/mikroorm/entities/'],
  clientUrl: process.env.DB_URL_TEST,
  seeder: {
    path: './dist/modules/mikroorm/seeders', // path to the folder with seeders
    pathTs: './src/modules/mikroorm/seeders', // path to the folder with TS seeders (if used, we should put path to compiled files in `path`)
    glob: '!(*.d).{js,ts}', // how to match seeder files (all .js and .ts files, but not .d.ts)
    emit: 'ts', // seeder generation mode
    fileName: (className: string) => className, // seeder file naming convention
  },
};

export default MikroORMOptions;
