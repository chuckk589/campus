import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosRequestConfig, Method, AxiosResponse } from 'axios';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class AxiosRetryService {
  constructor(
    private readonly httpService: HttpService,
    @InjectPinoLogger('AxiosRetryService')
    private readonly logger: PinoLogger,
  ) {}
  request(options: { method: Method; url: string; data?: any } & AxiosRequestConfig): Promise<AxiosResponse> {
    let retries = 0;
    return new Promise((resolve, reject) => {
      this.httpService
        .axiosRef({
          method: options.method,
          url: options.url,
          data: options.data,
          ...options,
        })
        .then((response) => resolve(response))
        .catch((error) => {
          this.logger.info(`Request failed with status code ${error.response.status}, retries left: ${3 - retries}`);
          if (error.response.status === 429) {
            if (retries < 3) {
              retries++;
              setTimeout(() => {
                return this.request(options);
              }, 3000 * retries);
            } else {
              reject(error);
            }
          } else {
            reject(error);
          }
        });
    });
  }
}
