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
}

export interface State {
  exit: boolean;
  ui: {
    width: number;
    height: number;
    gameList: GameListState;
    filter: FilterState;
  };
  data: {
    games: GameInfo[];
  };
}
