import { State } from './model';

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
      limit: 20,
      offset: 0,
      orderBy: ['name'],
      sortDesc: false,
    },
  },
  data: {
    games: [],
  },
};
