import { Global, Module } from '@nestjs/common';
import { AxiosRetryService } from './axios-retry.service';
import { HttpModule } from '@nestjs/axios';

@Global()
@Module({
  imports: [HttpModule],
  providers: [AxiosRetryService],
  exports: [AxiosRetryService],
})
export class AxiosRetryModule {}
