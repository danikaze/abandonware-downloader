import { join } from 'path';
import { GameInfo } from '../interfaces';
import { getSettings } from './settings';

export type Path = 'gameDownloads' | 'gameScreenshots' | 'gameInfo' | 'internalData';

export function pathBuilder(path: Path, info: Partial<GameInfo> = {}): string {
  const settings = getSettings();
  const values = {
    root: join(__dirname, '..', '..'),
    name: info.name || '',
    platform: info.meta && info.meta.platform || '',
    year: info.meta && info.meta.year || '',
    genre: info.meta && info.meta.genre || '',
    publisher: info.meta && info.meta.publisher || '',
  };

  return Object.keys(values).reduce((str, key) => {
    const regExp = new RegExp(`(\\[${key}\\])`, 'gi');
    return str.replace(regExp, values[key]);
  }, settings[`${path}Path`]);
}
