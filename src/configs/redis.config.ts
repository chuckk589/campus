import { RedisOptions } from 'ioredis';

export const redisConnectionOptions: RedisOptions = {
  lazyConnect: false,
  password: process.env.REDIS_PASSWORD,
};
