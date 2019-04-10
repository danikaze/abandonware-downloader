import { State } from './model';

export const defaultState: State = {
  exit: false,
  ui: {
    view: 'gameList',
    width: process.stdout.columns,
    height: process.stdout.rows,
    gameList: {
      numberShown: 0,
      offset: 0,
      selected: 1,
      focused: 0,
      columns: ['name', 'year', 'platform'],
      games: [],
    },
    filter: {
      text: '',
      limit: 20,
      offset: 0,
      orderBy: ['name'],
      sortDesc: false,
    },
  },
};
