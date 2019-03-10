import { join } from 'path';
import { Browser } from 'puppeteer';
import { GameInfo } from '../interfaces';
import { Cache } from '../model/cache';
import { getSettings } from '../utils/settings';

export interface ParsedUrl {
  page: number;
  category: string;
}

export interface IndexPageConstructor {
  new(category: string, page?: number): IndexPage;
}

export interface IndexPage {
  readonly name: string;
  readonly categories: string[];
  getUrl(): string;
  getCategory(): string;
  getPage(): number;
  setCategory(category: string): string;
  setPage(page: number): string;
  nextPage(): string;
  nextCategory(): string;
  getNumberOfPages(browser: Browser): Promise<number>;
  getLinks(browser: Browser): Promise<GameInfo[]>;
}

export function createIndexPage(ctor: IndexPageConstructor, category: string, page?: number): IndexPage {
  return new ctor(category, page);
}

export abstract class BaseIndexPage implements IndexPage {
  public abstract readonly name: string;
  public abstract readonly categories: string[];

  protected url: string;
  protected category: string;
  protected page: number;

  private readonly cache = new Cache({
    path: join(getSettings().internalDataPath, 'cache-index.db'),
    ttl: getSettings().cacheIndexTtl,
  });

  constructor(category: string, page: number = 1) {
    this.category = category;
    this.page = page;
    this.url = this.updateUrl();
  }

  public getUrl(): string {
    return this.url;
  }

  public getCategory(): string {
    return this.category;
  }

  public getPage(): number {
    return this.page;
  }

  public setCategory(category: string): string {
    this.category = category;
    this.url = this.updateUrl();

    return this.url;
  }

  public setPage(page: number): string {
    this.page = page;
    this.url = this.updateUrl();

    return this.url;
  }

  public nextPage(): string {
    this.page++;
    this.url = this.updateUrl();

    return this.url;
  }

  public nextCategory(): string {
    const data = this.parseUrl();
    const index = this.categories.indexOf(data.category);
    this.page = 1;

    return this.setCategory(this.categories[index + 1]);
  }

  public async getNumberOfPages(browser: Browser): Promise<number> {
    const cacheKey = `index-n-pages-${this.category}-${this.page}`;

    let data = await this.cache.get<number>(cacheKey);
    if (data) {
      return data;
    }

    data = await this.getActualNumberOfPages(browser);
    this.cache.set(cacheKey, data);

    return data;
  }

  public async getLinks(browser: Browser): Promise<GameInfo[]> {
    const cacheKey = `index-links-${this.category}-${this.page}`;

    let data = await this.cache.get<GameInfo[]>(cacheKey);
    if (data) {
      return data;
    }

    data = await this.getActualLinks(browser);
    this.cache.set(cacheKey, data);

    return data;
  }

  protected abstract async getActualNumberOfPages(browser: Browser): Promise<number>;

  protected abstract async getActualLinks(browser: Browser): Promise<GameInfo[]>;

  protected abstract updateUrl(): string;

  protected abstract parseUrl(): ParsedUrl;
}
