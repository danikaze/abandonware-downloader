import { State, DataState } from '../model';
import { Action } from '../actions';

export function dataReducer(state: State, action: Action): DataState {
  switch (action.type) {
    case 'updateGames': {
      return {
        ...state.data,
        games: action.games,
      };
    }

    default:
      return state.data;
  }
}
