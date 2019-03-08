import { writeFile, readFile, exists, unlink, existsSync, readdir, stat } from 'fs';
import { join } from 'path';
import { getLogger } from './logger';
import { sync as mkdirp } from 'mkdirp';

export interface CacheOptions {
  /** where cached data will be stored */
  path: string;
  /** time in seconds before invalidating data */
  ttl: number;
  /** if `false`, will leave expired cache files without removing them */
  cleanExpired?: boolean;
  /** if `true`, stored data (json) will be tabulated */
  pretty?: boolean;
}

export interface PurgedData {
  existingFiles: number;
  removedFiles: number;
}

interface CachedData<T> {
  t: number;
  d: T;
}

export class Cache {
  private readonly options: CacheOptions;

  constructor(options: CacheOptions) {
    const logger = getLogger();
    this.options = {
      cleanExpired: true,
      pretty: false,
      ...options,
    };
    const { path } = options;

    try {
      if (!existsSync(path)) {
        logger.log('debug', `cache folder created: ${path}`);
        mkdirp(path);
      }
    } catch (e) {
      logger.log('error', `cache folder: ${path}`);
    }
  }

  public async set<T>(key: string, data: T): Promise<void> {
    return new Promise((resolve, reject) => {
      const logger = getLogger();
      const { path, ttl, pretty } = this.options;
      const filepath = join(path, this.keyToFilename(key));
      const cacheObject: CachedData<T> = {
        t: new Date().getTime() + (ttl * 1000),
        d: data,
      };
      const str = JSON.stringify(cacheObject, null, pretty ? 2 : 0);

      writeFile(filepath, str, (error) => {
        if (error) {
          logger.log('error', `cache.set(${key})`);
          reject(error);
          return;
        }

        logger.log('debug', `cache.set(${key})`);
        resolve();
      });
    });
  }

  public async get<T>(key: string): Promise<T> {
    return new Promise((resolve, reject) => {
      const logger = getLogger();
      const { path, cleanExpired } = this.options;
      const filepath = join(path, this.keyToFilename(key));

      exists(filepath, (cached) => {
        if (!cached) {
          logger.log('debug', `cache.get(${key}) N/A`);
          resolve();
          return;
        }

        readFile(filepath, (error, data) => {
          if (error) {
            logger.log('error', `cache.get(${filepath})`);
            reject(error);
            return;
          }

          // tslint:disable-next-line:no-any
          let cacheObject: CachedData<any>;
          let corrupted = false;
          try {
            cacheObject = JSON.parse(data.toString());
          } catch (e) {
            logger.log('error', `cache.get parsing(${filepath})`);
            corrupted = true;
          }

          // check for expiration
          if (corrupted || (cacheObject.t && cacheObject.t < new Date().getTime())) {
            resolve();
            logger.log('debug', `cache.get(${key}) expired`);
            if (cleanExpired) {
              this.remove(key);
            }
            return;
          }

          logger.log('debug', `cache.get(${key}) HIT`);
          resolve(cacheObject.d);
        });
      });
    });
  }

  public async remove(key: string): Promise<void> {
    const logger = getLogger();
    const { path } = this.options;
    const filepath = join(path, this.keyToFilename(key));

    try {
      await this.removeFile(filepath);
      logger.log('debug', `cache.remove(${key})`);
    } catch (e) {}
  }

  public async purge(): Promise<PurgedData> {
    return new Promise<PurgedData>((resolve, reject) => {
      const logger = getLogger();
      const { path, cleanExpired } = this.options;
      const purgedData: PurgedData = {
        existingFiles: 0,
        removedFiles: 0,
      };

      if (!cleanExpired || !existsSync(path)) {
        resolve(purgedData);
        return;
      }

      readdir(path, (error, files) => {
        if (error) {
          logger.log('error', `cache.purge(${path})`);
          return;
        }

        purgedData.existingFiles = files.length;
        const promises = files.map((file) => new Promise<void>((resolveOne, rejectOne) => {
          const filepath = join(path, file);
          stat(filepath, (error, stats) => {
            if (error) {
              logger.log('error', `cache.stat(${path})`);
              return;
            }

            if (!stats.isFile()) {
              return;
            }

            readFile(filepath, (error, data) => {
              if (error) {
                logger.log('error', `cache.get(${filepath})`);
                rejectOne(error);
                return;
              }

              // tslint:disable-next-line:no-any
              let cacheObject: CachedData<any>;
              let corrupted = false;
              try {
                cacheObject = JSON.parse(data.toString());
              } catch (e) {
                logger.log('error', `cache.purge parsing(${filepath})`);
                corrupted = true;
              }

              // check for expiration
              if (corrupted || (cacheObject.t && cacheObject.t < new Date().getTime())) {
                purgedData.removedFiles++;
                this.removeFile(filepath)
                  .then(resolveOne, rejectOne);
              } else {
                resolveOne();
              }
            }); // readFile
          }); // stat
        })); // files.map

        Promise.all(promises)
          .then(() => resolve(purgedData))
          .catch(reject);
      }); // readdir
    });
  }

  protected keyToFilename(key: string): string {
    return key.replace(/[<>:"/\\|?*'^&!]/g, '_');
  }

  private async removeFile(filepath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const logger = getLogger();

      unlink(filepath, (error) => {
        if (error) {
          logger.log('error', `cache.remove(${filepath})`);
          reject();
          return;
        }
        resolve();
      });
    });
  }
}
