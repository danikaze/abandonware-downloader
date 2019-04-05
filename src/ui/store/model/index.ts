import { GameInfo } from '../../../interfaces';

export interface GameListState {
  numberShown: number;
  offset: number;
  selected: number;
  focused: number;
  columns: string[];
}

export interface FilterState {
  text: string;
  limit?: number;
  offset?: number;
  orderBy?: Array<'name' | 'year' | 'score' | 'platform'>;
  sortDesc?: boolean;
}

export interface DataState {
  games: GameInfo[];
}

export interface State {
  exit: boolean;
  ui: {
    width: number;
    height: number;
    gameList: GameListState;
    filter: FilterState;
  };
  data: DataState;
}
