import { FileTransportOptions } from 'winston/lib/winston/transports';

export type Dict<T> = { [key: string]: T };

export interface Link {
  url: string;
  platform?: string;
  languages?: string[];
  info?: string;
  meta?: Dict<string>;
}

export interface GameInfo {
  pageUrl: string;
  updated: number;
  name?: string;
  meta?: Dict<string>;
  score?: number;
  votes?: number;
  description?: string;
  playOnlineLink?: string;
  downloadLinks?: Link[];
  screenshots?: Dict<string[]>; // { platform: urls[] }
  howTo?: string;
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
  internalDataDir?: string;
  debugCode?: boolean;
  log?: LogSettings[];
}
