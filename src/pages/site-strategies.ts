import { getSettings } from '../utils/settings';
import { Cache } from '../model/cache';
import { BaseIndexPage, IndexPageConstructor } from './index-page';
import { Dict, GameInfo, Platform } from '../interfaces';
import { join } from 'path';
import { Browser } from 'puppeteer';
import { pathBuilder } from '../utils/path-builder';
import { exists } from 'fs';

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

  /**
   * Get detailed information of a game
   */
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

  /**
   * Download the screenshots of a game into the hard drive (`settings.gameScreenshotsPath`)
   */
  public async downloadScreenshots(info: GameInfo): Promise<string[]> {
    const promises: Promise<string>[] = !info.screenshots
      ? []
      : Object.keys(info.screenshots).map((platform: Platform) => new Promise<string>((resolve, reject) => {
      info.screenshots[platform].forEach((url) => {
        exists(url.local || '', (exists) => {
          if (exists) {
            return url.local;
          }

          const outputPath = pathBuilder(
            'gameScreenshots',
            {
              ...info,
              platform,
            },
          );

          return this.downloadScreenshot(url.remote, outputPath)
            .then((finalPath) => {
              url.local = finalPath;
              resolve(finalPath);
            })
            .catch(reject);
        });
      });
    }));

    const result = await Promise.all(promises);
    await this.cache.set(info.pageUrl, info);

    return result;
  }

  protected abstract async getActualGameInfo(browser: Browser, url: string): Promise<GameInfo>;

  /**
   * @param url    URL of the screenshot to download
   * @param outputFolder Folder to store the screenshot
   */
  protected abstract async downloadScreenshot(url: string, outputFolder: string): Promise<string>;
}
