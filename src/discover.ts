import { Browser, LaunchOptions, launch } from 'puppeteer';
import { GameInfo } from './interfaces';
import { getLogger } from './utils/logger';
import { IndexPage } from './pages/index-page';
import { SearchIndexPage } from './pages/search-index-page';

export interface DiscoverOptions {
  /** Strategy to discover */
  index: IndexPage | SearchIndexPage;
  /** If `true`, it will enter each game page to retrieve more detailed information */
  gameDetails?: boolean;
  /**
   * If not specified, it will launch a new browser instance.
   * This browser will be closed automatically if created, but left open if specified
   */
  browser?: Browser;
  /** If specified, it will use this options when `browser` is not specified */
  browserLaunchOptions?: LaunchOptions;
  /** Function called when a game info is retrieved */
  onDiscover?(info: DiscoverInfo, requestStop: () => void): void | Promise<void>;
}

const defaultOptions: Partial<DiscoverOptions> = {
  gameDetails: false,
};

export interface DiscoverInfo {
  initialUrl: string;
  availablePages: number;
  startPage: number;
  currentPage: number;
  startCategory?: string;
  currentCategory?: string;
  gameList: GameInfo[];
}

// tslint:disable-next-line:no-any
function hasCategories(o: any): o is { getCategory(): string } {
  return typeof o.getCategory === 'function';
}

export async function discover(options: DiscoverOptions): Promise<DiscoverInfo> {
  const opt: DiscoverOptions = { ...defaultOptions, ...options };
  let stopRequested = false;

  function requestStop() {
    stopRequested = true;
  }

  const index = opt.index;

  const logger = getLogger();
  const initialUrl = index.getUrl();
  logger.log('info', `discover(${initialUrl})`);

  const browser = opt.browser ? opt.browser : await launch(opt.browserLaunchOptions);
  const startPage = index.getPage();
  const startCategory = hasCategories(index) && index.getCategory();
  const availablePages = await index.getNumberOfPages(browser) || 0;

  const info: DiscoverInfo = {
    initialUrl,
    availablePages,
    startPage,
    startCategory,
    currentPage: startPage,
    currentCategory: startCategory,
    gameList: [],
  };

  logger.log(
    'debug',
    `discover pages: ${info.currentPage}/${info.availablePages}`,
  );

  for (;;) {
    while (info.currentPage <= info.availablePages) {
      info.gameList.push.apply(info.gameList, await index.getLinks(browser));
      if (opt.onDiscover) {
        await opt.onDiscover({ ...info }, requestStop);
      }

      if (stopRequested) {
        break;
      }

      index.nextPage();
      info.currentPage = index.getPage();
    }

    if (stopRequested) {
      break;
    }

    if (!hasCategories(index)) {
      break;
    }

    index.nextCategory();
    info.currentCategory = index.getCategory();
    info.availablePages = await index.getNumberOfPages(browser);
    info.currentPage = index.getPage();
  }

  if (!opt.browser) {
    await browser.close();
  }

  return info;
}
