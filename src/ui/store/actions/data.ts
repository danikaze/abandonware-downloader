import { Action } from 'redux';
import { GameInfo } from '../../../interfaces';

export type ModelAction = UpdateGameListAction;

export interface UpdateGameListAction extends Action {
  type: 'updateGames';
  games: GameInfo[];
}

export function updateGames(games: GameInfo[]): UpdateGameListAction {
  return {
    games,
    type: 'updateGames',
  };
}
