import { GameInfo } from '../../../interfaces';

export type ViewTypes = 'gameList' | 'crawler';

export interface GameListState {
  numberShown: number;
  offset: number;
  selected: number;
  focused: number;
  columns: string[];
  games: GameInfo[];
}

export interface FilterState {
  text: string;
  limit?: number;
  offset?: number;
  orderBy?: Array<'name' | 'year' | 'score' | 'platform'>;
  sortDesc?: boolean;
}

export interface State {
  exit: boolean;
  ui: {
    width: number;
    height: number;
    gameList: GameListState;
    filter: FilterState;
    view: ViewTypes;
  };
}
