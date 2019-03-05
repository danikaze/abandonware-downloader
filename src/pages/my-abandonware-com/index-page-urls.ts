export enum GameGenres {
  ACTION = 1,
  ADVENTURE = 2,
  EDUCATIONAL = 3,
  PUZZLE = 9,
  RACING = 4,
  RPG = 5,
  SIMULATION = 7,
  SPORTS = 8,
  STRATEGY = 6,
}

export enum Platforms {
  'amiga',
  'amiga-cd32',
  'cpc',
  'apple2',
  'apple2gs',
  'atari-8-bit',
  'atari-st',
  'colecovision',
  'commodore-16-plus4',
  'c64',
  'dos',
  'dragon-3264',
  'game-gear',
  'genesis',
  'linux',
  'mac',
  'msx',
  'pc88',
  'pc98',
  'sega-32x',
  'sega-cd',
  'sega-master-system',
  'vic-20',
  'windows',
  'win3x',
  'zx-spectrum',
}

export const availableLetters = '$0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
export const availableYears = (() => {
  const years: number[] = [];
  // tslint:disable-next-line:no-magic-numbers
  for (let y = 1978; y < 2018; y++) {
    years.push(y);
  }
  return years;
})();

export function getIndexPageByGenre(genre: GameGenres): string {
  return `https://www.myabandonware.com/browse/genre/${GameGenres[genre].toLowerCase()}-${genre}/`;
}

export function getIndexPageByName(letter?: string): string {
  const url = 'https://www.myabandonware.com/browse/name/';

  if (!letter) {
    return url;
  }

  return `${url}${letter.toUpperCase()}`;
}

export function getIndexPageByYear(year: number): string {
  return `https://www.myabandonware.com/browse/year/${year}/`;
}

export function getIndexPageByPlatform(platform: Platforms): string {
  return `https://www.myabandonware.com/browse/platform/${platform}/`;
}
