import { MiddlewareConsumer, Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AppConfigModule } from './modules/app-config/app-config.module';
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
import { RestrictionModule } from './modules/restriction/restriction.module';
// import { TestModule } from './modules/test/test.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { OwnerModule } from './modules/owner/owner.module';
import { RedisModule } from './modules/redis/redis.module';
import { PrometheusModule, makeCounterProvider, makeGaugeProvider } from '@willsoto/nestjs-prometheus';
import { MetricsMiddleware } from './common/metricsMiddleware';

@Module({
  imports: [
    RedisModule,
    AppConfigModule.forRootAsync(),
    MikroOrmModule.forRoot(ORMOptionsProvider),
    EventEmitterModule.forRoot(),
    LoggerModule.forRoot({
      pinoHttp: {
        autoLogging: false,
        quietReqLogger: true,
        transport: {
          target: 'pino-pretty',
          options: {
            singleLine: true,
          },
        },

        level: 'info',
      },
    }),
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
    RestrictionModule,
    OwnerModule,
    PrometheusModule.register({
      defaultMetrics: {
        enabled: false,
      },
    }),
    // TestModule,
  ],
  controllers: [],
  providers: [
    makeCounterProvider({
      name: 'count',
      help: 'metric_help',
      labelNames: ['method', 'origin'] as string[],
    }),
    makeGaugeProvider({
      name: 'gauge',
      help: 'metric_help',
    }),
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MetricsMiddleware).forRoutes('/v1');
  }
}
