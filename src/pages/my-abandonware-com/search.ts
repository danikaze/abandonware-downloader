import { Browser } from 'puppeteer';
import { GameInfo, Platform, FilterOptions } from '../../interfaces';
import { BaseSearchIndexPage } from '../search-index-page';
import { getNumberOfIndexPages, getIndexLinks } from './get-index-links';

export interface Filter extends FilterOptions {
  rating?: number;
}

export class SearchIndex extends BaseSearchIndexPage<Filter> {
  public readonly name: string = 'Search';

  private static getPlatformId(platform: Platform): number {
    // tslint:disable:object-literal-key-quotes
    const mapping = {
      'amiga': 8,
      'amiga-cd32': 9,
      'cpc': 10,
      'apple2': 13,
      'apple2gs': 14,
      'atari-8-bit': 19,
      'atari-st': 20,
      'colecovision': 31,
      'commodore-16-plus4': 33,
      'c64': 34,
      'dos': 1,
      'dragon-3264': 37,
      'game-gear': 52,
      'genesis': 56,
      'linux': 3,
      'mac': 2,
      'msx': 63,
      'pc88': 86,
      'pc98': 87,
      'sega-32x': 101,
      'sega-cd': 102,
      'sega-master-system': 103,
      'vic-20': 125,
      'windows': 4,
      'win3x': 5,
      'zx-spectrum': 138,
    };
    // tslint:enable:object-literal-key-quotes

    return mapping[platform];
  }

  protected async getActualNumberOfPages(browser: Browser): Promise<number> {
    return getNumberOfIndexPages(browser, this.url);
  }

  protected async getActualLinks(browser: Browser): Promise<GameInfo[]> {
    return getIndexLinks(browser, this.url);
  }

  protected updateUrl(): string {
    const page = this.page;
    const filter = this.filter;

    let url = `https://www.myabandonware.com/search`;

    if (filter.name) {
      url += `/q/${filter.name}`;
    }

    if (filter.platform) {
      url += `/pla/${SearchIndex.getPlatformId(filter.platform)}`;
    }

    if (filter.year) {
      url += `/y/${filter.year}`;
    }

    if (filter.rating) {
      url += `/rt/${String(filter.rating).replace('.', '').padEnd(2, '0')}`;
    }

    return page > 1 ? `${url}page/${page}/` : url;
  }
}
