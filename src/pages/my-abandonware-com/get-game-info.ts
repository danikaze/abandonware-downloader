import { Browser, Page } from 'puppeteer';
import { GameInfo, Dict } from '../../interfaces';
import { asyncParallel } from '../../utils/async-parallel';
import { toCamelCase } from '../../utils/to-camel-case';

async function getName(page: Page, info: GameInfo): Promise<void> {
  try {
    info.name = await page.$eval('.box h2', (elem: HTMLHeadElement) => elem.innerText);
  } catch (e) {}
}

async function getMeta(page: Page, info: GameInfo): Promise<void> {
  info.meta = {};
  try {
    (await page.$$eval('.gameInfo tr', (rows) => rows.map((row: HTMLTableRowElement) => [
      row.querySelector('th').innerText,
      row.querySelector('td').innerText,
    ]))).forEach((meta) => {
      const metaName = toCamelCase(meta[0]);
      info.meta[metaName] = meta[1];
    });
  } catch (e) {}
}

async function getScore(page: Page, info: GameInfo): Promise<void> {
  try {
    const scoreInfo = await page.$eval(
      '.gameRated',
      (elem: HTMLDivElement) => [
        (elem.children[0] as HTMLSpanElement).innerText,
        (elem.children[2] as HTMLSpanElement).innerText,
      ],
    );
    info.score = Number(scoreInfo[0]);
    info.votes = Number(scoreInfo[1]);
  } catch (e) {}
}

async function getPlayOnlineLink(page: Page, info: GameInfo): Promise<void> {
  try {
    info.playOnlineLink = await page.$eval('.gamePlay a', (a: HTMLAnchorElement) => a.href);
  } catch (e) {}
}

async function getPlatforms(page: Page, info: GameInfo): Promise<Dict<string>> {
  const platforms = {};

  try {
    const data = await page.$$eval('#screentabs a', (links: HTMLAnchorElement[]) => links.map((a) => [
      a.dataset.platform,
      a.innerText,
    ]));
    data.forEach((item) => { platforms[item[0]] = item[1]; });
  } catch (e) {}

  return platforms;
}

async function getScreenshots(page: Page, info: GameInfo): Promise<void> {
  async function getPlatformScreenshots(platformId): Promise<string[]> {
    try {
      const screenshots = await page.$$eval(
        `.items.screens[data-platform="${platformId}"] .thumb img`,
        (imgs: HTMLImageElement[]) => imgs.map((img) => img.src),
      );
      return screenshots;
    } catch (e) {
      return [];
    }
  }

  const platforms = await getPlatforms(page, info);
  info.screenshots = {};

  await asyncParallel(Object.keys(platforms), async (platformId) => {
    const platformName = platforms[platformId];
    info.screenshots[platformName] = await getPlatformScreenshots(platformId);
  });
}

async function getDescription(page: Page, info: GameInfo): Promise<void> {
  try {
    info.description = await page.$eval('.gameDescription.dscr', (elem: HTMLDivElement) => elem.innerHTML);
  } catch (e) {}
}

export async function getGameInfo(browser: Browser, url: string): Promise<GameInfo> {
  const page = await browser.newPage();
  await page.goto(url);

  const info: GameInfo = {
    pageUrl: url,
    updated: new Date().getUTCDate(),
  };

  await Promise.all([
    getName(page, info),
    getMeta(page, info),
    getScore(page, info),
    getPlayOnlineLink(page, info),
    getScreenshots(page, info),
    getDescription(page, info),
  ]);

  await page.close();
  return info;
}
