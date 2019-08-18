import { Browser } from 'puppeteer';
import { getLogger } from '../../utils/logger';
import { GameInfo } from '../../interfaces';
import { getBrowserNewPage } from '../../utils/get-browser-new-page';

/**
 * Get short information of game pages from the index
 *
 * @param browser Browser instance to run the query
 * @param url     URL for the index page
 */
export async function getIndexLinks(browser: Browser, url: string): Promise<GameInfo[]> {
  const logger = getLogger();
  logger.log('info', `getIndexLinks(${url})`);

  const page = await getBrowserNewPage(browser);
  await page.goto(url);
  const gameList = await page.$$eval(
    '.itemListGame',
    (items) => (items as HTMLDivElement[]).map((item) => {
      if (item.querySelector('.art')) {
        return;
      }

      const link = item.querySelector('.name a') as HTMLAnchorElement;
      const platform = (item.querySelector('.ptf') as HTMLSpanElement);
      const year = (item.querySelector('.year') as HTMLSpanElement);

      return {
        pageUrl: link.href,
        name: link.innerHTML,
        platform: platform && platform.innerHTML,
        year: year && Number(year.innerHTML),
        meta: {},
      };
    }),
  );

  await page.close();
  return gameList.filter((item) => item) as GameInfo[];
}

export async function getNumberOfIndexPages(browser: Browser, baseUrl: string): Promise<number> {
  const logger = getLogger();
  logger.log('info', `getNumberOfIndexPages(${baseUrl})`);

  const page = await getBrowserNewPage(browser);
  let nPages = 0;

  try {
    await page.goto(baseUrl);
    nPages = await page.evaluate(() => {
      const links = document.querySelectorAll('.pagination a');
      const last = links[links.length - 1] as HTMLAnchorElement;
      return last ? Number(last.innerText) : 0;
    });
  } catch (e) {}

  await page.close();
  return nPages;
}
