import { join } from 'path';
import { Cache } from '../model/cache';
import { getSettings } from '../utils/settings';
import { asyncParallel } from '../utils/async-parallel';

export async function getIndexCacheKeys(filter: 'all' | 'valid' | 'expired'): Promise<string[]> {
  const cache = new Cache({
    ttl: 0,
    path: join(getSettings().internalDataPath, 'cache-index.db'),
    cleanExpired: false,
    debug: true,
  });

  return cache.keys(filter);
}

export async function extendCacheTtl(cache: Cache): Promise<void> {
  const keys = await cache.keys('all');
  await asyncParallel(keys, async (key) => {
    const value = await cache.get(key);
    await cache.set(key, value);
  });
}
