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

async function initApp(settingsFile: string) {
  const settings = loadSettings(settingsFile);
  initLogger(settings.log);

  const logger = getLogger();
  logger.log('info', `Settings loaded from ${settingsFile}`);
}

async function run() {
  async function getFullGameInfo(site: Site, game: GameInfo, remaining: number): Promise<void> {
    console.log(` * ${game.name} (${game.year}) [${game.platform}] (${remaining} games remaining)`);
    const fullInfo = await site.getGameInfo(browser, game.pageUrl);
    await gameModel.set(fullInfo);
  }

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

  async function onDiscoverCallback(info: DiscoverInfo, requestStop: () => void): Promise<void> {
    // console.log(`Discovered page ${info.currentPage}/${info.availablePages} of ${info.currentCategory}`);
    while (shownGames < info.gameList.length) {
      const game = info.gameList[shownGames++];
      // console.log(` * ${game.name} (${game.year}) [${game.platform}]`);
      queue.addItems(game);
    }
  }

  // tslint:disable-next-line:no-magic-numbers
  await discover({
    browser,
    index: createIndexPage(site.indexStrategies.Year, '1978'),
    onDiscover: onDiscoverCallback,
  });
}

run();
