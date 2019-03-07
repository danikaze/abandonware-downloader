import { Browser, LaunchOptions, launch } from 'puppeteer';
import { GameInfo } from './interfaces';
import { getLogger } from './utils/logger';
import { IndexPage } from './pages/index-page';

export interface DiscoverOptions {
  /** Strategy to discover */
  index: IndexPage;
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
  onDiscover?(info: DiscoverInfo): void;
}

const defaultOptions: Partial<DiscoverOptions> = {
  gameDetails: false,
};

export interface DiscoverInfo {
  initialUrl: string;
  availablePages: number;
  startPage: number;
  currentPage: number;
  startCategory: string;
  currentCategory: string;
  gameList: GameInfo[];
}

export async function discover(options: DiscoverOptions): Promise<DiscoverInfo> {
  return new Promise(async (resolve) => {
    const opt: DiscoverOptions = { ...defaultOptions, ...options };
    const index = opt.index;

    const logger = getLogger();
    const initialUrl = index.getUrl();
    logger.log('info', `discover(${initialUrl})`);

    const browser = opt.browser ? opt.browser : await launch(opt.browserLaunchOptions);
    const startPage = index.getPage();
    const startCategory = index.getCategory();
    const availablePages = await index.getNumberOfPages(browser);

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

    while (info.currentCategory) {
      while (info.currentPage <= info.availablePages) {
        info.gameList.push.apply(info.gameList, await index.getLinks(browser));
        if (opt.onDiscover) {
          opt.onDiscover({ ...info });
        }
        index.nextPage();
        info.currentPage = index.getPage();
      }
      index.nextCategory();
      info.availablePages = await index.getNumberOfPages(browser);
      info.currentPage = index.getPage();
      info.currentCategory = index.getCategory();
    }

    if (!opt.browser) {
      await browser.close();
    }

    resolve(info);
  });
}
