import { EntityManager, MikroORM } from '@mikro-orm/core';
import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigModuleOptions, ConfigService } from '@nestjs/config';
import { Config } from '../mikroorm/entities/Config';
import { AppConfigService } from './app-config.service';

@Global()
@Module({
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {
  constructor(private readonly em: EntityManager) {}
  public static async forRootAsync(options: ConfigModuleOptions = {}): Promise<DynamicModule> {
    const ConfigProvider: Provider = {
      provide: 'any',
      useFactory: async (orm: MikroORM) => {
        const configs = await orm.em.find(Config, {});
        configs.map((config) => (process.env[config.name] = config.value));
        return {};
      },
      inject: [MikroORM],
    };
    return {
      module: AppConfigModule,
      imports: [ConfigModule.forRoot()],
      providers: [ConfigProvider],
      exports: [ConfigModule],
    };
  }
}
