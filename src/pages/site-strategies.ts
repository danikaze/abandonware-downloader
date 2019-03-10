import { getSettings } from '../utils/settings';
import { Cache } from '../model/cache';
import { BaseIndexPage, IndexPageConstructor } from './index-page';
import { Dict, GameInfo } from '../interfaces';
import { join } from 'path';

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

  public async getGameInfo(info: GameInfo): Promise<GameInfo> {
    const cacheKey = `gameinfo-${info.name}`;

    let data = await this.cache.get<GameInfo>(cacheKey);
    if (data) {
      return data;
    }

    data = await this.getActualGameInfo(info);
    this.cache.set(cacheKey, data);

    return data;
  }

  protected abstract async getActualGameInfo(info: GameInfo): Promise<GameInfo>;
}
