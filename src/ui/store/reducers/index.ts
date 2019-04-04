import { State } from '../model';
import { Action } from '../actions';
import { gameListReducer } from './game-list';
import { mainReducer } from './main';

export function reducer(state: State, action: Action): State {
  const newState = {
    ...state,
    ...mainReducer(state, action),
  };
  newState.ui.gameList = gameListReducer(state, action);

  return newState;
}
