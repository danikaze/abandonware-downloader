import { State } from './model';
import { Platform } from '../../interfaces';

export const defaultState: State = {
  exit: false,
  ui: {
    width: process.stdout.columns,
    height: process.stdout.rows,
    gameList: {
      numberShown: 0,
      offset: 0,
      selected: 1,
      focused: 0,
      columns: ['name', 'year', 'platform'],
    },
    filter: {
      text: '',
    },
  },
  data: {
    // test data, to be retrieved from the Model
    games: [
      {
        id: 1,
        pageUrl: 'https://www.myabandonware.com/game/narco-police-yr',
        name: 'Narco Police',
        year: 1990,
        platform: 'dos12e21e12e12e12e12e12e12e12e12e12e12e12e12e12e12e12e12e' as Platform,
      },
      {
        id: 2,
        pageUrl: 'https://www.myabandonware.com/game/simcity-2000-1nf',
        name: 'Sim City 2000',
        year: 1993,
        platform: 'dos' as Platform,
      },
      {
        id: 3,
        pageUrl: 'https://www.myabandonware.com/game/angband-1c3',
        name: 'Angband',
        year: 1997,
        platform: 'dos' as Platform,
      },
    ],
  },
};
