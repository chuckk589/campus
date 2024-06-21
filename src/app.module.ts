import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
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
import { PrometheusModule, makeCounterProvider, makeGaugeProvider, makeHistogramProvider } from '@willsoto/nestjs-prometheus';
import { MetricsMiddleware } from './common/metricsMiddleware';
import { HttpLoggingInterceptor } from './common/http-logging.interceptor';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';

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
    PrometheusModule.register({}),
    // TestModule,
  ],
  controllers: [],
  providers: [
    makeHistogramProvider({
      name: 'http_request_duration_ms',
      help: 'Duration of HTTP requests in ms',
      labelNames: ['route', 'method', 'code'],
      // buckets for response time from 0.1ms to 500ms
      buckets: [0.1, 5, 15, 50, 100, 200, 300, 400, 500],
    }),
    makeCounterProvider({
      name: 'http_request_total',
      help: 'Total of HTTP request',
      labelNames: ['route', 'method', 'code'],
    }),
    makeHistogramProvider({
      name: 'http_response_size_bytes',
      help: 'Size in bytes of response',
      labelNames: ['route', 'method', 'code'],
      buckets: [0.1, 5, 15, 50, 100, 200, 300, 400, 500],
    }),
    makeHistogramProvider({
      name: 'http_request_size_bytes',
      help: 'Size in bytes of request',
      labelNames: ['route', 'method', 'code'],
      buckets: [0.1, 5, 15, 50, 100, 200, 300, 400, 500],
    }),
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(HttpLoggingInterceptor)
      .exclude({ path: 'metrics', method: RequestMethod.GET }, { path: 'health', method: RequestMethod.GET })
      .forRoutes('*');
  }
}
