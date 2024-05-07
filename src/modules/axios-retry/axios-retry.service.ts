import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosRequestConfig, Method, AxiosResponse } from 'axios';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import https from 'https';

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
        .catch((error) => {
          this.logger.error(`Request failed with status code ${error?.response?.status}, retries left: ${retries}, url: ${options.url}`);
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
