// tslint:disable: no-console
import { launch } from 'puppeteer';
import { loadSettings, getSettingsPath, getSettings } from './utils/settings';
import { getLogger, initLogger } from './utils/logger';
import { discover, DiscoverInfo } from './discover';
import { IndexPlatform } from './pages/my-abandonware-com/index-strategies';

function initApp(settingsFile: string) {
  const settings = loadSettings(settingsFile);
  initLogger(settings.log);

  const logger = getLogger();
  logger.log('info', `Settings loaded from ${settingsFile}`);
}

async function run() {
  initApp(getSettingsPath());
  const settings = getSettings();

  const browser = await launch({
    headless: !settings.debugCode,
    devtools: settings.debugCode,
  });

  let shownGames = 0;
  let iterations = 3;

  function onDiscoverCallback(info: DiscoverInfo, requestStop: () => void) {
    console.log(`Discovered page ${info.currentPage}/${info.availablePages} of ${info.currentCategory}`);
    while (shownGames < info.gameList.length) {
      const game = info.gameList[shownGames++];
      console.log(` * ${game.name} (${game.meta.year}) [${game.meta.platform}]`);
    }

    iterations--;
    if (iterations === 0) {
      requestStop();
    }
  }

  // tslint:disable-next-line:no-magic-numbers
  await discover({
    browser,
    index: new IndexPlatform('dos'),
    onDiscover: onDiscoverCallback,
  });

  await browser.close();
}

run();
