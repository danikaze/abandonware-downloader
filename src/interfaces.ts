import { FileTransportOptions } from 'winston/lib/winston/transports';

export type Dict<T> = { [key: string]: T };

export type Platform = 'amiga'
                     | 'amiga-cd32'
                     | 'cpc'
                     | 'apple2'
                     | 'apple2gs'
                     | 'atari-8-bit'
                     | 'atari-st'
                     | 'colecovision'
                     | 'commodore-16-plus4'
                     | 'c64'
                     | 'dos'
                     | 'dragon-3264'
                     | 'game-gear'
                     | 'genesis'
                     | 'linux'
                     | 'mac'
                     | 'msx'
                     | 'pc88'
                     | 'pc98'
                     | 'sega-32x'
                     | 'sega-cd'
                     | 'sega-master-system'
                     | 'vic-20'
                     | 'windows'
                     | 'win3x'
                     | 'zx-spectrum';

export interface Download {
  remote: string;
  local?: string;
}

export interface Link {
  url: Download;
  year?: number;
  platform?: Platform;
  languages?: string[];
  info?: string;
  meta?: Dict<string>;
}

export interface GameInfo {
  id?: number;
  pageUrl: string;
  updated?: number;
  name?: string;
  year?: number;
  platform: Platform;
  meta?: Dict<string>;
  score?: number;
  votes?: number;
  description?: string;
  playOnlineLink?: string;
  downloadLinks?: Link[];
  screenshots?: Partial<{ [platform in Platform]: Download[] }>;
  howTo?: string;
}

export interface FilterOptions {
  name?: string;
  year?: number;
  platform?: Platform;
  limit?: number;
  offset?: number;
  orderBy?: Array<'name' | 'year' | 'score' | 'platform'>;
  sortDesc?: boolean;
}

export type LogLevel = 'crit'     // critical error, app closing
                     | 'error'    // error, but the app can work
                     | 'warn'     // something weird happened
                     | 'info'     // process going
                     | 'debug'    // all possible info
                     ;

export interface LogSettings {
  /* if the output file is not specified, it will use the console */
  fileOptions?: FileTransportOptions;
  /** colored output? */
  colors?: boolean;
  /** minimum level to log */
  level?: LogLevel;
}

export interface Settings {
  /** base output dir */
  outputDir: string;
  /** where the game downloads will be stored */
  gameDownloadsPath: string;
  /** where game screenshots will be stored */
  gameScreenshotsPath: string;
  /** where game info (json) will be stored */
  gameInfoPath: string;
  /** where the app will save internal data */
  internalDataPath?: string;
  /** Cache TTL for index pages / crawling */
  cacheIndexTtl: number;
  /** Cache TTL for game info pages */
  cacheGameInfoTtl: number;
  /** `true` to open DevTools */
  debugCode?: boolean;
  /** List of log interfaces */
  log?: LogSettings[];
}
