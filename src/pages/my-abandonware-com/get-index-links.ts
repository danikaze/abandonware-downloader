import { Browser } from 'puppeteer';
import { getLogger } from '../../utils/logger';

/**
 * Get links of game pages from the index
 *
 * @param browser Browser instance to run the query
 * @param pageN Number of the page (as the page uses)
 */
export async function getIndexLinks(browser: Browser, baseUrl: string, pageN: number): Promise<string[]> {
  const url = `${baseUrl}${pageN > 1 ? `page/${pageN}/` : ''}`;

  const logger = getLogger();
  logger.log('info', `getIndexLinks(${url})`);

  const page = await browser.newPage();
  await page.goto(url);
  const links = await page.$$eval(
    '.thumb a[href^="/game/"]',
    (links) => (links as HTMLAnchorElement[]).map((link) => link.href),
  );

  await page.close();
  return links;
}

export async function getNumberOfIndexPages(browser: Browser, baseUrl: string): Promise<number> {
  const logger = getLogger();
  logger.log('info', `getNumberOfIndexPages(${baseUrl})`);

  const page = await browser.newPage();
  let nPages: number;

  try {
    await page.goto(baseUrl);
    nPages = await page.evaluate(() => {
      const links = document.querySelectorAll('.pagination a');
      return Number((links[links.length - 1] as HTMLAnchorElement).innerText);
    });
  } catch (e) {}

  await page.close();
  return nPages;
}
