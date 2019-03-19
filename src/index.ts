// tslint:disable: no-console
import { launch } from 'puppeteer';
import { loadSettings, getSettingsPath, getSettings } from './utils/settings';
import { getLogger, initLogger } from './utils/logger';
import { discover, DiscoverInfo } from './discover';
import { Site } from './pages/my-abandonware-com/site';
import { createIndexPage } from './pages/index-page';

async function initApp(settingsFile: string) {
  const settings = loadSettings(settingsFile);
  initLogger(settings.log);

  const logger = getLogger();
  logger.log('info', `Settings loaded from ${settingsFile}`);
}

async function run() {
  await initApp(getSettingsPath());
  const settings = getSettings();

  const browser = await launch({
    headless: !settings.debugCode,
    devtools: settings.debugCode,
  });

  let shownGames = 0;
  let iterations = 3;
  let searchInfo;

  async function onDiscoverCallback(info: DiscoverInfo, requestStop: () => void) {
    console.log(`Discovered page ${info.currentPage}/${info.availablePages} of ${info.currentCategory}`);
    while (shownGames < info.gameList.length) {
      const game = info.gameList[shownGames++];
      console.log(` * ${game.name} (${game.year}) [${game.platform}]`);
    }

    iterations--;
    if (iterations === 0) {
      requestStop();
      searchInfo = info.gameList[0];
    }
  }

  const site = new Site();

  // tslint:disable-next-line:no-magic-numbers
  await discover({
    browser,
    index: createIndexPage(site.indexStrategies.Year, '1981'),
    onDiscover: onDiscoverCallback,
  });

  console.log(JSON.stringify(searchInfo, null, 2));
  const fullInfo = await site.getGameInfo(browser, searchInfo.pageUrl);
  console.log(JSON.stringify(fullInfo, null, 2));
  await site.downloadScreenshots(fullInfo);
  await site.downloadGameLinks(fullInfo);

  await browser.close();
}

run();
