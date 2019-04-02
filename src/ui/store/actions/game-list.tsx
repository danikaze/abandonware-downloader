import { Action } from 'redux';

export type GameListAction = MoveFocusedGame | SelectFocusedGame;

export interface MoveFocusedGame extends Action {
  type: 'moveFocusedGame';
  delta: number;
}

export interface SelectFocusedGame extends Action {
  type: 'selectFocusedGame';
}
