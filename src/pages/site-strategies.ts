import { getSettings } from '../utils/settings';
import { Cache } from '../model/cache';
import { BaseIndexPage, IndexPageConstructor } from './index-page';
import { Dict, GameInfo } from '../interfaces';
import { join } from 'path';
import { Browser } from 'puppeteer';

export interface IndexStrategy {
  strategies: string[];
  page: BaseIndexPage;
}

export abstract class SiteStrategies {
  public abstract readonly name: string;
  public abstract readonly indexStrategies: Dict<IndexPageConstructor>;

  private readonly cache = new Cache({
    path: join(getSettings().internalDataPath, 'cache-gameInfo.db'),
    ttl: getSettings().cacheGameInfoTtl,
  });

  public async getGameInfo(browser: Browser, url: string): Promise<GameInfo> {
    const cacheKey = url;

    let data = await this.cache.get<GameInfo>(cacheKey);
    if (data) {
      return data;
    }

    data = await this.getActualGameInfo(browser, url);
    this.cache.set(cacheKey, data);

    return data;
  }

  protected abstract async getActualGameInfo(browser: Browser, url: string): Promise<GameInfo>;
}
