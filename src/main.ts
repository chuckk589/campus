import tracer from './tracer';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfigService } from './modules/app-config/app-config.service';
import { LoggerErrorInterceptor } from 'nestjs-pino';
import { REDIS_STORE } from './constants';
import RedisStore from 'connect-redis';
import session from 'express-session';
import passport from 'passport';

async function bootstrap() {
  await tracer.start();
  const app = await NestFactory.create(AppModule);

  const redisStore: RedisStore = app.get(REDIS_STORE);
  app.use(
    session({
      store: redisStore,
      secret: process.env.EXPRESS_SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.enableVersioning({ type: VersioningType.URI });
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new LoggerErrorInterceptor());
  const configService = app.get(AppConfigService);
  await app.listen(configService.get('port'));
}
bootstrap();
