import { Action } from 'redux';

export type GameListAction = MoveFocusedGame | SelectFocusedGame;

export interface MoveFocusedGame extends Action {
  type: 'moveFocusedGame';
  delta: number;
}

export interface SelectFocusedGame extends Action {
  type: 'selectFocusedGame';
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
