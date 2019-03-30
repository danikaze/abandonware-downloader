// tslint:disable: no-console
import { launch } from 'puppeteer';
import { loadSettings, getSettingsPath, getSettings } from './utils/settings';
import { getLogger, initLogger } from './utils/logger';
import { discover, DiscoverInfo } from './discover';
import { Site } from './pages/my-abandonware-com/site';
import { createIndexPage } from './pages/index-page';
import { Queue } from './utils/queue';
import { GameInfo } from './interfaces';
import { Game } from './model/game';

let stopDiscover = false;

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
    queue.stop();
  }

  async function getFullGameInfo(site: Site, game: GameInfo, remaining: number): Promise<void> {
    console.log(` * ${game.name} (${game.year}) [${game.platform}] (${remaining} games remaining)`);
    const fullInfo = await site.getGameInfo(browser, game.pageUrl);
    await gameModel.set(fullInfo);
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
  const site = new Site();
  const browser = await launch({
    headless: !settings.debugCode,
    devtools: settings.debugCode,
  });

  let shownGames = 0;
  const queue = new Queue<GameInfo>({
    threads: 5,
    consumer: getFullGameInfo.bind(null, site),
  });

  // tslint:disable-next-line:no-magic-numbers
  await discover({
    browser,
    index: createIndexPage(site.indexStrategies.Year, '1978'),
    onDiscover: onDiscoverCallback,
  });
}

run();
