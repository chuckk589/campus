export const redisConnectionOptions = {
  url: process.env.REDIS_URL,
  ttl: 60 * 60 * 24 * 7, // 1 week
};
