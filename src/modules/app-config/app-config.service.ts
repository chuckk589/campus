import { Controller, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService, @Inject('any') any: any) {}
  get<T>(key: string, options?: any) {
    return this.configService.get<T>(key, options) || this.configService.get<T>(key.toUpperCase(), options);
  }
}
