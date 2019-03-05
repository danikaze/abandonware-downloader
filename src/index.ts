import { launch } from 'puppeteer';
import { asyncParallel } from './utils/async-parallel';
import { getIndexLinks, getNumberOfIndexPages } from './pages/my-abandonware-com/get-index-links';
import { getGameInfo } from './pages/my-abandonware-com/get-game-info';
import { getIndexPageByYear, availableYears } from './pages/my-abandonware-com/index-page-urls';
import { loadSettings, getSettingsPath, getSettings } from './utils/settings';
import { getLogger, initLogger } from './utils/logger';

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

  const indexUrl = getIndexPageByYear(availableYears[1]);
  const nPages = await getNumberOfIndexPages(browser, indexUrl);
  const links = await getIndexLinks(browser, indexUrl, nPages);

  await asyncParallel(links, async (link) => {
    await getGameInfo(browser, link);
  });

  await browser.close();
}

run();
