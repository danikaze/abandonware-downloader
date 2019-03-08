import { Browser } from 'puppeteer';
import { getNumberOfIndexPages, getIndexLinks } from './get-index-links';
import { ParsedUrl, IndexPage } from '../index-page';
import { GameInfo } from '../../interfaces';
import { getLogger } from '../../utils/logger';

export function getIndexPageClass(name: string, categoryName: string, categories: string[]) {
  return class Index extends IndexPage {
    public readonly name: string = name;
    public readonly categories: string[] = categories;

    protected async getActualNumberOfPages(browser: Browser): Promise<number> {
      const data = this.parseUrl();

      return data && getNumberOfIndexPages(browser, this.url);
    }

    protected async getActualLinks(browser: Browser): Promise<GameInfo[]> {
      return getIndexLinks(browser, this.url);
    }

    protected updateUrl(): string {
      const category = this.category;
      const page = this.page;

      if (!category) {
        return;
      }

      const url = `https://www.myabandonware.com/browse/${categoryName}/${category}/`;

      return page > 1 ? `${url}page/${page}/` : url;
    }

    protected parseUrl(): ParsedUrl {
      // tslint:disable:no-magic-numbers
      const urlRegEx = new RegExp(`^https\:\/\/www\.myabandonware\.com\/browse\/${categoryName}\/([^\/]*)\/(page\/(\\d+)\/)?$`);
      const match = urlRegEx.exec(this.url);

      if (!match) {
        getLogger().log('error', `parseUrl(${this.url})`);
      }

      return match && {
        category: match[1],
        page: Number(match[3]) || 1,
      };
    }
  };
}
