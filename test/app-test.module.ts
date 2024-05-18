import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { LoggerModule } from 'nestjs-pino';
import { join } from 'path';
import { AnswersModule } from 'src/modules/answers/answers.module';
import { AppConfigModule } from 'src/modules/app-config/app-config.module';
import { AttemptModule } from 'src/modules/attempt/attempt.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { AxiosRetryModule } from 'src/modules/axios-retry/axios-retry.module';
import { CodeModule } from 'src/modules/code/code.module';
import { QuizModule } from 'src/modules/quiz/quiz.module';
import { RestrictionModule } from 'src/modules/restriction/restriction.module';
import { ResultsModule } from 'src/modules/results/results.module';
import { StatusModule } from 'src/modules/status/status.module';
import { TestModule } from 'src/modules/test/test.module';
import { UserModule } from 'src/modules/user/user.module';
import MikroORMOptions from './utils/mikro-orm.test.config';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    AppConfigModule.forRootAsync(),
    MikroOrmModule.forRoot(MikroORMOptions),
    LoggerModule.forRoot({ pinoHttp: { level: 'silent' } }),
    // ServeStaticModule.forRoot({ rootPath: join(__dirname, './', 'public/') }),
    ServeStaticModule.forRoot({ rootPath: join(__dirname, '..', '/dist/public/') }),
    EventEmitterModule.forRoot(),
    UserModule,
    AuthModule,
    StatusModule,
    QuizModule,
    CodeModule,
    AnswersModule,
    AttemptModule,
    ResultsModule,
    AxiosRetryModule,
    RestrictionModule,
    TestModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
