import { exists } from 'fs';
import { join } from 'path';
import { Browser } from 'puppeteer';
import { getSettings } from '../utils/settings';
import { Cache } from '../model/cache';
import { Dict, GameInfo, Platform, Download } from '../interfaces';
import { pathBuilder } from '../utils/path-builder';
import { getCookies, downloadStatic } from '../utils/download';
import { BaseIndexPage, IndexPageConstructor } from './index-page';
import { CoreOptions } from 'request';
import { SearchIndexPage } from './search-index-page';

export interface IndexStrategy {
  strategies: string[];
  page: BaseIndexPage;
}

export interface DownloadOptions {
  /** URL of the file to download */
  url: string;
  /** Folder to store the downloaded file */
  outputFolder: string;
  /** Available info about the game */
  gameInfo: GameInfo;
  /** Cookies string, if available */
  cookies?: string;
}

export abstract class SiteStrategies {
  public abstract readonly name: string;
  public abstract readonly indexStrategies: Dict<IndexPageConstructor>;
  public abstract readonly searchIndexStrategy: SearchIndexPage;
  protected abstract readonly needsCookiesForGameScreenshots: boolean;
  protected abstract readonly needsCookiesForGameLinks: boolean;

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
  public async downloadScreenshots(info: GameInfo): Promise<void> {
    const promises = [];
    let cookies: string;

    if (info.screenshots) {
      Object.keys(info.screenshots).forEach(async (platform: Platform) => {
        const pendingLinks = await this.filterNeededLinks(info.screenshots[platform]);
        cookies = cookies || (pendingLinks.length > 0 ? await this.getCookies(info) : undefined);

        pendingLinks.forEach((url) => {
          promises.push(new Promise<void>((resolve, reject) => {
            const outputPath = pathBuilder(
              'gameScreenshots',
              {
                ...info,
                platform,
              },
            );

            return this.downloadScreenshot({
              cookies,
              url: url.remote,
              gameInfo: info,
              outputFolder: outputPath,
            })
            .then((finalPath) => {
              url.local = finalPath;
            });
          }));
        });
      });
    }

    await Promise.all(promises);
    // update the cache with the local paths of the game screenshots (in background)
    this.cache.set(info.pageUrl, info);
  }

  /**
   * Download the downloads of a game into the hard drive (`settings.gameDownloadsPath`)
   */
  public async downloadGameLinks(info: GameInfo): Promise<void> {
    const pendingLinks = info.downloadLinks ? await this.filterNeededLinks(info.downloadLinks, (dl) => dl.url) : [];
    const cookies = this.needsCookiesForGameLinks && pendingLinks.length > 0 ? await this.getCookies(info) : undefined;
    const promises = pendingLinks.map((link) => {
      const outputPath = pathBuilder(
        'gameDownloads',
        {
          ...info,
          year: link.year || info.year,
          platform: link.platform || info.platform,
        },
      );

      return this.downloadGameLink({
        cookies,
        url: link.url.remote,
        gameInfo: info,
        outputFolder: outputPath,
      })
      .then((finalPath) => {
        link.url.local = finalPath;
      });
    });

    await Promise.all(promises);
    // update the cache with local paths for the game links (in background)
    this.cache.set(info.pageUrl, info);
  }

  /**
   * Defines how to get the cookies from the site, in case of needed
   */
  protected async getCookies(info: GameInfo): Promise<string> {
    return getCookies(info.pageUrl);
  }

  /**
   * Download a single screenshot
   */
  protected async downloadScreenshot(options: DownloadOptions): Promise<string> {
    return await downloadStatic(options.url, options.outputFolder);
  }

  /**
   * Download a single game link
   */
  protected async downloadGameLink(options: DownloadOptions): Promise<string> {
    const requestOptions: CoreOptions = {
      headers: {
        Cookie: options.cookies,
        Referer: options.gameInfo.pageUrl,
      },
    };

    return await downloadStatic(options.url, options.outputFolder, requestOptions);
  }

  protected abstract async getActualGameInfo(browser: Browser, url: string): Promise<GameInfo>;

  /**
   * Given a list of objects, return only those whose links are not available locally
   *
   * @param items List of objects
   * @param getDl Function to retrieve the Download info for that item
   */
  private async filterNeededLinks<T>(items: T[], getDl?: (item: T) => Download): Promise<T[]> {
    const result = [];
    const promises = items.map((item) => new Promise((resolve) => {
      const dl = getDl ? getDl(item) : item as unknown as Download;
      exists(dl.local || '', (exists) => {
        if (!exists) {
          result.push(item);
        }
        resolve();
      });
    }));

    await Promise.all(promises);
    return result;
  }
}
