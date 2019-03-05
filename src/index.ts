import { launch } from 'puppeteer';
import { asyncParallel } from './utils/async-parallel';
import { getIndexLinks, getNumberOfIndexPages } from './pages/my-abandonware-com/get-index-links';
import { getGameInfo } from './pages/my-abandonware-com/get-game-info';
import { getIndexPageByYear, availableYears } from './pages/my-abandonware-com/index-page-urls';

async function run() {
  const browser = await launch();

  const indexUrl = getIndexPageByYear(availableYears[10]);
  const nPages = await getNumberOfIndexPages(browser, indexUrl);
  const links = await getIndexLinks(browser, indexUrl, nPages);
  console.log(`Retrieved`);

  await asyncParallel(links, async (link) => {
    const info = await getGameInfo(browser, link);
    console.log(info);
  });

  console.log('end');
  await browser.close();
}

run();
