import { Browser, Page } from 'puppeteer';
import { Dict, GameInfo, Link, Platform } from '../../interfaces';
import { asyncParallel } from '../../utils/async-parallel';
import { getLogger } from '../../utils/logger';
import { toCamelCase } from '../../utils/to-camel-case';

async function getName(page: Page, info: GameInfo): Promise<void> {
  try {
    info.name = await page.$eval('.box h2', (elem: HTMLHeadElement) => elem.innerHTML);
  } catch (e) {
    const logger = getLogger();
    logger.log('warn', `getName not available for ${info.pageUrl}`);
  }
}

async function getMeta(page: Page, info: GameInfo): Promise<void> {
  info.meta = {};
  try {
    (await page.$$eval('.gameInfo tr', (rows) => rows.map((row: HTMLTableRowElement) => [
      row.querySelector('th').innerText,
      row.querySelector('td').innerText,
    ]))).forEach((meta) => {
      const metaName = toCamelCase(meta[0]);
      if (metaName === 'platform') {
        info.platform = meta[1] as Platform;
      } else if (metaName === 'year') {
        info.year = Number(meta[1]);
      } else {
        info.meta[metaName] = meta[1];
      }
    });
  } catch (e) {
    const logger = getLogger();
    logger.log('warn', `getMeta not available for ${info.pageUrl}`);
  }
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
  } catch (e) {
    const logger = getLogger();
    logger.log('warn', `getScore not available for ${info.pageUrl}`);
  }
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
  } catch (e) {
    const logger = getLogger();
    logger.log('warn', `getPlatforms not available for ${info.pageUrl}`);
  }

  return platforms;
}

async function getScreenshots(page: Page, info: GameInfo): Promise<void> {
  async function getPlatformScreenshots(platformId): Promise<string[]> {
    try {
      const screenshots = await page.$$eval(
        `.items.screens[data-platform="${platformId}"] .thumb a`,
        (imgs: HTMLAnchorElement[]) => imgs.map((img) => img.href),
      );
      return screenshots;
    } catch (e) {
      const logger = getLogger();
      logger.log('warn', `getPlatformScreenshots(${platformId}) not available for ${info.pageUrl}`);
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
  // multiple <p> descriptions
  try {
    info.description = await page.$eval('.gameDescription.dscr', (elem: HTMLDivElement) => elem.innerHTML);
  } catch (e) {
    // single <p> descriptions
    try {
      info.description = await page.$eval(
        '#content h3.cBoth',
        (elem: HTMLHeadElement) => elem.parentElement.children[1].innerHTML,
      );
    } catch (e) {
      const logger = getLogger();
      logger.log('warn', `getDescription not available for ${info.pageUrl}`);
    }
  }
}

async function getDownloadLinks(page: Page, info: GameInfo): Promise<void> {
  try {
    const links = await page.$$eval('#download .platformDownload, #download .buttons', (elems: HTMLElement[]) => {
      function isUnneeded(elem: HTMLElement): boolean {
        return elem.classList.contains('art');
      }

      function processVersion(elem, link: Link): boolean {
        if (elem.className !== 'platformDownload') {
          return false;
        }

        link.platform = elem.id;
        link.meta = undefined;
        link.info = undefined;
        link.languages = undefined;
        return true;
      }

      function processMeta(elem: HTMLElement, link: Link): boolean {
        if (elem.className !== 'platformMeta') {
          return false;
        }
        link.meta = {};
        Array.from(elem.children)
              .forEach((li: HTMLLIElement) => {
                const key = (li.children[0] as HTMLSpanElement).innerText;
                const value = (li.children[0] as HTMLAnchorElement).innerText;
                link.meta[key] = value;
              });
        return true;
      }

      function processBigButtons(elem: HTMLElement, link: Link, links: Link[]): boolean {
        if (elem.className !== 'buttons') {
          return false;
        }

        const children = Array.from(elem.querySelectorAll('a'));
        for (const child of children) {
          link.url = child.href;

          const imgs = Array.from(child.querySelectorAll('span img')) as HTMLImageElement[];
          if (imgs.length > 0) {
            link.languages = imgs.length > 0 ? imgs.map((img) => /([^/.]+)\.gif$/.exec(img.src)[1]) : undefined;
          }

          const spans = Array.from(child.querySelectorAll('span')) as HTMLSpanElement[];
          spans.forEach((span) => span.parentElement.removeChild(span));

          link.info = child.innerHTML || undefined;
          links.push({ ...link });
        }
        return true;
      }

      function processSmallButtons(elem: HTMLElement, link: Link, links: Link[]): boolean {
        if (!elem.classList.contains('buttons') && !elem.classList.contains('list')) {
          return false;
        }
        const children = Array.from(elem.children);
        for (const child of children) {
          if (child.classList.contains('cBoth')) {
            continue;
          }
          if (child instanceof HTMLAnchorElement) {
            link.url = child.href;
            link.languages = undefined;
            link.info = undefined;
            continue;
          }
          if (child instanceof HTMLSpanElement) {
            link.info = child.innerHTML;
            link.info = link.info.substring(0, link.info.indexOf('<')).trim();
            const imgs = Array.from(child.querySelectorAll('span img')) as HTMLImageElement[];
            link.languages = imgs.map((img) => /([^/.]+)\.gif$/.exec(img.src)[1]);
            links.push({ ...link });
            link.url = undefined;
            link.languages = undefined;
            link.info = undefined;
          }
        }
        if (link.url) {
          links.push({ ...link });
        }
      }

      debugger;
      const links: Link[] = [];
      const link: Link = {
        url: undefined,
      };

      let i = -1;
      while (i + 1 < elems.length) {
        i++;
        const elem = elems[i];

        if (isUnneeded(elem)) {
          continue;
        }

        if (processVersion(elem, link)) {
          continue;
        }
        if (processMeta(elem, link)) {
          continue;
        }
        if (processBigButtons(elem, link, links)) {
          continue;
        }

        if (processSmallButtons(elem, link, links)) {
          continue;
        }
      }

      return links;
    });

    info.downloadLinks = links;
  } catch (e) {
    const logger = getLogger();
    logger.log('warn', `getDownloadLinks not available for ${info.pageUrl}`);
  }
}

export async function getGameInfo(browser: Browser, url: string): Promise<GameInfo> {
  const logger = getLogger();
  logger.log('info', `getGameInfo(${url})`);

  const page = await browser.newPage();
  await page.goto(url);

  const info: GameInfo = {
    pageUrl: url,
    updated: new Date().getTime(),
    platform: undefined,
    year: undefined,
  };

  await Promise.all([
    getName(page, info),
    getMeta(page, info),
    getScore(page, info),
    getPlayOnlineLink(page, info),
    getScreenshots(page, info),
    getDescription(page, info),
    getDownloadLinks(page, info),
  ]);

  await page.close();
  return info;
}
