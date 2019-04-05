import { Action } from 'redux';
import { GameInfo } from '../../../interfaces';

export type GameListAction = MoveFocusedGame | SelectFocusedGame | UpdateGameList;

export interface MoveFocusedGame extends Action {
  type: 'moveFocusedGame';
  delta: number;
}

export interface SelectFocusedGame extends Action {
  type: 'selectFocusedGame';
}

export interface UpdateGameList extends Action {
  type: 'updateGames';
  games: GameInfo[];
}

export function moveFocusedGame(delta: number): MoveFocusedGame {
  return {
    delta,
    type: 'moveFocusedGame',
  };
}

export function selectFocusedGame(): SelectFocusedGame {
  return {
    type: 'selectFocusedGame',
  };
}

export function updateGames(games: GameInfo[]): UpdateGameList {
  return {
    games,
    type: 'updateGames',
  };
}
