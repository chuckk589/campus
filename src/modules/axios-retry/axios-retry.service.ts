import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosRequestConfig, Method, AxiosResponse } from 'axios';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import https from 'https';
import { AxiosError } from 'axios';

@Injectable()
export class AxiosRetryService {
  constructor(
    private readonly httpService: HttpService,
    @InjectPinoLogger('AxiosRetryService')
    private readonly logger: PinoLogger,
  ) {}
  request(options: { method: Method; url: string; data?: any } & AxiosRequestConfig, retries = 3): Promise<AxiosResponse> {
    return new Promise((resolve, reject) => {
      this.httpService
        .axiosRef({
          method: options.method,
          url: options.url,
          httpsAgent: new https.Agent({
            rejectUnauthorized: false,
          }),
          data: options.data,
          ...options,
        })
        .then((response) => resolve(response))
        .catch((error: AxiosError) => {
          this.logger.error(
            `Request failed code: ${error?.response?.status}, message: ${
              error.message
            }, retries left: ${retries}, options: ${JSON.stringify(options)}`,
          );
          if (retries > 0) {
            setTimeout(() => {
              return this.request(options, retries - 1);
            }, 3000);
          } else {
            reject(error);
          }
        });
    });
  }
}
