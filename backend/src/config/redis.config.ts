import { ConfigService } from '@nestjs/config';
import { CacheModuleOptions } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

export const getRedisConfig = (configService: ConfigService): CacheModuleOptions => ({
  store: redisStore,
  host: configService.get('REDIS_HOST'),
  port: configService.get('REDIS_PORT'),
  ttl: 3600, // 1 hour default
});
