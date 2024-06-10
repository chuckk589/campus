import { Module } from '@nestjs/common';
import IORedis from 'ioredis';

import { REDIS, REDIS_STORE } from '../../constants';
import { redisConnectionOptions } from 'src/configs/redis.config';
import RedisStore from 'connect-redis';
import { redisStoreOptions } from 'src/configs/redis.store.config';

@Module({
  providers: [
    {
      provide: REDIS,
      useValue: new IORedis(process.env.REDIS_URL, redisConnectionOptions),
    },

    {
      provide: REDIS_STORE,
      useFactory: (redis: IORedis) => {
        return new RedisStore({
          client: redis,
          ...redisStoreOptions,
        });
      },
      inject: [REDIS],
    },
  ],
  exports: [REDIS, REDIS_STORE],
})
export class RedisModule {}
