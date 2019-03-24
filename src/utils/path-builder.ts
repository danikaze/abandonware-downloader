import { join, resolve } from 'path';
import { GameInfo } from '../interfaces';
import { getSettings } from './settings';

export type Path = 'gameDownloads' | 'gameScreenshots' | 'gameInfo' | 'internalData';

function safeValue(str: string): string {
  return str.replace(/[\///|:<>*"?]/g, '-');
}

export function pathBuilder(path: Path, info: Partial<GameInfo> = {}): string {
  const settings = getSettings();
  const values = {
    root: join(__dirname, '..', '..'),
    name: safeValue(info.name || ''),
    platform: safeValue(info.platform || ''),
    year: safeValue(String(info.year) || ''),
    genre: safeValue(info.meta && info.meta.genre || ''),
    publisher: safeValue(info.meta && info.meta.publisher || ''),
  };

  const link = Object.keys(values).reduce((str, key) => {
    const regExp = new RegExp(`(\\[${key}\\])`, 'gi');
    return str.replace(regExp, values[key]);
  }, settings[`${path}Path`]);

  return resolve(link);
}
