import Redis, { Redis as RedisClient } from 'ioredis';

import ICacheProvider from '../models/ICacheProvider';

export default class RedisCacheProvider implements ICacheProvider {
  private client: RedisClient;

  constructor() {
    this.client = new Redis();
  }

  public async save(key: string, value: string): Promise<void> {}

  public async recover(key: string): Promise<string> {}

  public async invalidate(key: string): Promise<void> {}
}
