import { join } from 'path';
import { Browser } from 'puppeteer';
import { GameInfo, FilterOptions } from '../interfaces';
import { Cache } from '../model/cache';
import { getSettings } from '../utils/settings';

export interface SearchIndexPageConstructor<F = FilterOptions> {
  new(filter?: F, page?: number): SearchIndexPage;
}

export interface SearchIndexPage<F = FilterOptions> {
  readonly name: string;
  readonly filter: F;
  getUrl(): string;
  getPage(): number;
  setPage(page: number): string;
  nextPage(): string;
  getNumberOfPages(browser: Browser): Promise<number>;
  setFilter(filter: FilterOptions): string;
  getLinks(browser: Browser): Promise<GameInfo[]>;
}

export function createIndexPage<F extends FilterOptions = FilterOptions>(
  ctor: SearchIndexPageConstructor,
  filter?: F,
  page?: number
): SearchIndexPage {
  return new ctor(filter, page);
}

export abstract class BaseSearchIndexPage<F extends {} = FilterOptions> implements SearchIndexPage<F> {
  public abstract readonly name: string;
  public filter: F;

  protected url: string;
  protected category: string;
  protected page: number;

  private readonly cache = new Cache({
    path: join(getSettings().internalDataPath, 'cache-index.db'),
    ttl: getSettings().cacheIndexTtl,
  });

  constructor(filter: F = {} as F, page: number = 1) {
    this.filter = filter;
    this.page = page;
    this.url = this.updateUrl();
  }

  public getUrl(): string {
    return this.url;
  }

  public getPage(): number {
    return this.page;
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

  public async getNumberOfPages(browser: Browser): Promise<number> {
    const cacheKey = `n-${this.getUrl()}`;

    let data = await this.cache.get<number>(cacheKey);
    if (data) {
      return data;
    }

    data = await this.getActualNumberOfPages(browser);
    this.cache.set(cacheKey, data);

    return data;
  }

  public setFilter(filter: F): string {
    this.filter = filter;
    this.url = this.updateUrl();

    return this.url;
  }

  public async getLinks(browser: Browser): Promise<GameInfo[]> {
    const cacheKey = `l-${this.getUrl()}`;

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
}
