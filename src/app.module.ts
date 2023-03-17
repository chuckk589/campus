import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConfigService } from '@nestjs/config';
import { AppConfigModule } from './modules/app-config/app-config.module';
import { MikroORM } from '@mikro-orm/core';
import { Config } from './modules/mikroorm/entities/Config';
import { LoggerModule } from 'nestjs-pino';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { StatusModule } from './modules/status/status.module';
import { QuizModule } from './modules/quiz/quiz.module';
import { CodeModule } from './modules/code/code.module';
import { AnswersModule } from './modules/answers/answers.module';
import { AttemptModule } from './modules/attempt/attempt.module';
import { ResultsModule } from './modules/results/results.module';
import { AxiosRetryModule } from './modules/axios-retry/axios-retry.module';
import ORMOptionsProvider from 'src/configs/mikro-orm.config';

@Module({
  imports: [
    AppConfigModule.forRootAsync(),
    MikroOrmModule.forRoot(ORMOptionsProvider),
    LoggerModule.forRoot({
      pinoHttp: {
        quietReqLogger: true,
        transport: {
          target: 'pino-pretty',
          options: {
            singleLine: true,
          },
        },

        level: process.env.NODE_ENV !== 'production' ? 'info' : 'silent',
      },
    }),
    // ServeStaticModule.forRoot({ rootPath: join(__dirname, './', 'public/') }),
    ServeStaticModule.forRoot({ rootPath: join(__dirname, '..', '/dist/public/') }),
    UserModule,
    AuthModule,
    StatusModule,
    QuizModule,
    CodeModule,
    AnswersModule,
    AttemptModule,
    ResultsModule,
    AxiosRetryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
