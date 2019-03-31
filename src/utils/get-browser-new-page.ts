import { Browser, Page } from 'puppeteer';
import { getSettings } from './settings';

/**
 * Get a new page of the browser applying debug settings (viewport)
 */
export async function getBrowserNewPage(browser: Browser): Promise<Page> {
  const { debugCode, debugViewport } = getSettings();

  const page = await browser.newPage();

  if (debugCode && debugViewport) {
    await page.setViewport(debugViewport);
  }

  return page;
}
