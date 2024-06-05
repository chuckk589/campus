import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfigService } from './modules/app-config/app-config.service';
import { LoggerErrorInterceptor } from 'nestjs-pino';
import session from 'express-session';
import passport from 'passport';
import RedisStore from 'connect-redis';
import IORedis from 'ioredis';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const redisConnectionOptions = {
    url: process.env.REDIS_URL,
    ttl: 60 * 60 * 24 * 7, // 1 week
  };
  const redisClient = new IORedis({ lazyConnect: true, ...redisConnectionOptions });

  // connecting to Redis
  await redisClient.connect();

  // ping Redis
  const res = await redisClient.ping();
  console.log('Redis Session Store Client Sessions Ping: ', res);

  const redisStore = new RedisStore({
    client: redisClient,
    prefix: 'campus:',
  });

  app.use(
    session({
      store: redisStore,
      secret: process.env.EXPRESS_SESSION_SECRET,
      resave: false, // required: force lightweight session keep alive (touch)
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
