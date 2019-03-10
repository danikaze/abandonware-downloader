import { dirname } from 'path';
import * as request from 'request';
import { sync as mkdirp } from 'mkdirp';
import { GameInfo } from '../../interfaces';
import { writeFile, existsSync } from 'fs';
import { pathBuilder } from '../../utils/path-builder';
import { getLogger } from '../../utils/logger';
import { getCookies, downloadStatic } from '../../utils/download';

export interface DownloadInfoOptions {
  info?: boolean;
  downloads?: boolean;
  screenshots?: boolean;
}

async function storeGameInfo(info: GameInfo): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const logger = getLogger();
    logger.log('debug', `storeGameInfo(${info.name})`);

    try {
      const outputPath = pathBuilder('gameInfo', info);

      const outputFolder = dirname(outputPath);
      if (!existsSync(outputFolder)) {
        mkdirp(outputFolder);
      }

      writeFile(outputPath, JSON.stringify(info, null, 2), ((error) => {
        if (error) {
          logger.log('error', `storeGameInfo(${info.name}) (${error})`);
          reject(error);
          return;
        }

        resolve(outputPath);
      }));
    } catch (error) {
      logger.log('error', `storeGameInfo(${info.name}) (${error})`);
      reject(error);
    }
  });
}

async function storeGameDownloads(info: GameInfo): Promise<string[]> {
  return new Promise<string[]>(async (resolve, reject) => {
    const logger = getLogger();
    logger.log('debug', `storeGameDownloads(${info.name})`);

    const promises: Promise<string>[] = [];

    if (info.downloadLinks) {
      const requestOptions: request.CoreOptions = {
        headers: {
          Cookie: await getCookies(info.pageUrl),
          Referer: info.pageUrl,
        },
      };

      info.downloadLinks.forEach((link) => {
        const outputPath = pathBuilder('gameDownloads', {
          ...info,
          meta: {
            ...info.meta,
            ...link.meta,
            platform: link.platform,
          },
        });
        logger.log('debug', `downloading link ${link.url} => ${outputPath}`);
        promises.push(
          downloadStatic(link.url.remote, outputPath, requestOptions)
            .then((localPath) => {
              link.url.local = localPath;
              return localPath;
            })
        );
      });
    }

    Promise.all(promises).then(resolve, reject);
  });
}

async function storeGameScreenshots(info: GameInfo): Promise<string[]> {
  return new Promise<string[]>((resolve, reject) => {
    const logger = getLogger();
    logger.log('debug', `storeGameScreenshots(${info.name})`);

    const promises = [];

    if (info.screenshots) {
      Object.keys(info.screenshots).forEach((platform) => {
        info.screenshots[platform].forEach((url) => {
          const outputPath = pathBuilder(
            'gameScreenshots',
            {
              ...info,
              meta: {
                ...info.meta,
                platform,
              },
            },
          );
          logger.log('debug', `downloading screenshot ${url} => ${outputPath}`);
          promises.push(
            downloadStatic(url.remote, outputPath)
              .then((localPath) => {
                url.local = localPath;
                return localPath;
              })
          );
        });
      });
    }

    Promise.all(promises).then(resolve, reject);
  });
}

/**
 * Download game's data:
 * - info json
 * - download links
 * - screenshots
 *
 * @param info JSON with all the information from a game
 */
export async function downloadGame(info: GameInfo, options?: DownloadInfoOptions): Promise<void> {
  const opt = {
    info: true,
    downloads: true,
    screenshots: true,
    ...options,
  };
  const promises = [];
  const logger = getLogger();
  logger.log('info', `downloadInfo(${info.name})`);

  if (opt.info) {
    promises.push(storeGameInfo(info));
  }

  if (opt.downloads) {
    promises.push(storeGameDownloads(info));
  }

  if (opt.screenshots) {
    promises.push(storeGameScreenshots(info));
  }

  await Promise.all(promises);
}
