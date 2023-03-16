import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfigService } from './modules/app-config/app-config.service';
import { LoggerErrorInterceptor } from 'nestjs-pino';
import fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableVersioning({ type: VersioningType.URI });
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new LoggerErrorInterceptor());
  const configService = app.get(AppConfigService);
  if (!fs.existsSync(`./dist/public/files`)) {
    fs.mkdirSync(`./dist/public/files`, { recursive: true });
  }
  await app.listen(configService.get('port'));
}
bootstrap();
