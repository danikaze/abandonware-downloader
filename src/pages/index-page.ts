import { Browser } from 'puppeteer';
import { GameInfo } from '../interfaces';

export interface ParsedUrl {
  page: number;
  category: string;
}

export abstract class IndexPage {
  public abstract readonly name: string;
  public abstract readonly categories: string[];

  protected url: string;
  protected category: string;
  protected page: number;

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

  public abstract async getNumberOfPages(browser: Browser): Promise<number>;

  public abstract async getLinks(browser: Browser): Promise<GameInfo[]>;

  protected abstract updateUrl(): string;

  protected abstract parseUrl(): ParsedUrl;
}
