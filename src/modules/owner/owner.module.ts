import { Module } from '@nestjs/common';
import { OwnerService } from './owner.service';
import { OwnerController } from './owner.controller';
import { RedisModule } from '../redis/redis.module';

@Module({
  controllers: [OwnerController],
  providers: [OwnerService],
  imports: [RedisModule],
})
export class OwnerModule {}
