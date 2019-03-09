export const NAME_INITIALS = '$0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
export const YEARS = (() => {
  // tslint:disable:no-magic-numbers
  const years: string[] = [];
  for (let y = 1978; y < 2018; y++) {
    years.push(String(y));
  }
  return years;
})();
export const PLATFORMS = [
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
];
export const GENRES = [
  'action-1',
  'adventure-2',
  'educational-3',
  'puzzle-9',
  'racing-4',
  'rpg-5',
  'simulation-7',
  'sports-8',
  'strategy-6',
];
