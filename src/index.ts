// tslint:disable: no-console
import { launch, Browser } from 'puppeteer';
import { loadSettings, getSettingsPath, getSettings } from './utils/settings';
import { getLogger, initLogger } from './utils/logger';
import { discover, DiscoverInfo } from './discover';
import { Site } from './pages/my-abandonware-com/site';
import { Queue } from './utils/queue';
import { GameInfo } from './interfaces';
import { Game } from './model/game';
import { start } from './ui';
import { createIndexPage } from './pages/index-page';
import { YEARS } from './pages/my-abandonware-com/constants';

let stopDiscover = false;
let endOfTheQueue = false;

async function initApp(settingsFile: string) {
  const settings = loadSettings(settingsFile);
  initLogger(settings.log);

  const logger = getLogger();
  logger.log('info', `Settings loaded from ${settingsFile}`);
}

async function run() {
  function exitHandler(signal: string) {
    console.log(`Caught interrupt signal (${signal}). Finishing open processes...`);
    stopDiscover = true;
    if (queue) {
      queue.stop();
    }
  }

  async function getFullGameInfo(resolve: () => void, site: Site, game: GameInfo, remaining: number): Promise<void> {
    console.log(` * ${game.name} (${game.year}) [${game.platform}] (${remaining} games remaining)`);
    const fullInfo = await site.getGameInfo(browser, game.pageUrl);
    await gameModel.set(fullInfo);

    if (endOfTheQueue && remaining === 0) {
      resolve();
    }
  }

  async function onDiscoverCallback(info: DiscoverInfo, requestStop: () => void): Promise<void> {
    if (stopDiscover) {
      requestStop();
      return;
    }

    // console.log(`Discovered page ${info.currentPage}/${info.availablePages} of ${info.currentCategory}`);
    while (shownGames < info.gameList.length) {
      const game = info.gameList[shownGames++];
      // console.log(` * ${game.name} (${game.year}) [${game.platform}]`);
      queue.addItems(game);
    }
  }

  process.on('SIGTERM', exitHandler.bind(null, 'SIGTERM'));
  process.on('SIGINT', exitHandler.bind(null, 'SIGINT'));
  process.on('SIGHUP', exitHandler.bind(null, 'SIGHUP'));

  await initApp(getSettingsPath());
  const settings = getSettings();
  const gameModel = new Game();
  const appPromises: Promise<void>[] = [];
  let shownGames = 0;
  let queue: Queue<GameInfo>;
  let site: Site;
  let browser: Browser;

  const appFeats = {
    discover: true,
    ui: false,
  };

  if (appFeats.discover) {
    appPromises.push(new Promise(async (resolve) => {
      site = new Site();
      browser = await launch({
        headless: !settings.debugCode,
        devtools: settings.debugCode,
      });

      queue = new Queue<GameInfo>({
        threads: 5,
        consumer: getFullGameInfo.bind(null, resolve, site),
      });

      // site.searchIndexStrategy.setFilter({
      //   name: 'ninja',
      // });

      // tslint:disable-next-line:no-magic-numbers
      await discover({
        browser,
        index: createIndexPage(site.indexStrategies.Year, YEARS[0]),
        // index: site.searchIndexStrategy,
        onDiscover: onDiscoverCallback,
      });
      endOfTheQueue = true;
    }));
  }

  if (appFeats.ui) {
    appPromises.push(start({
      gameModel,
    }));
  }

  await Promise.all(appPromises);
  await browser.close();
}

run();
