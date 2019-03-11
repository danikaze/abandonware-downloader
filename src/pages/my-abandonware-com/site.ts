import { Dict, GameInfo } from '../../interfaces';
import { SiteStrategies } from '../site-strategies';
import { IndexPageConstructor } from '../index-page';
import { getIndexPageClass } from './get-index-page-class';
import { NAME_INITIALS, YEARS, PLATFORMS, GENRES } from './constants';
import { getGameInfo } from './get-game-info';
import { Browser } from 'puppeteer';

export const IndexName = getIndexPageClass('Name', 'name', NAME_INITIALS);
export const IndexYear = getIndexPageClass('Year', 'year', YEARS);
export const IndexPlatform = getIndexPageClass('Platform', 'platform', PLATFORMS);
export const IndexGenre = getIndexPageClass('Genre', 'genre', GENRES);

export class Site extends SiteStrategies {
  public readonly name = 'myabandonware.com';
  public readonly indexStrategies: Dict<IndexPageConstructor> = {
    Name: IndexName,
    Year: IndexYear,
    Platform: IndexPlatform,
    Genre: IndexGenre,
  };

  protected readonly needsCookiesForGameScreenshots = false;
  protected readonly needsCookiesForGameLinks = true;

  protected async getActualGameInfo(browser: Browser, url: string): Promise<GameInfo> {
    return await getGameInfo(browser, url);
  }
}
