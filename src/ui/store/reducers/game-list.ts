import { Action } from '../actions';
import { GameListState } from '../model';

export function gameListReducer(state: GameListState, action: Action) {
  switch (action.type) {
    case 'moveFocusedGame':
      return {
        ...state,
        focused: state.focused + action.delta,
      };

    case 'selectFocusedGame':
      return {
        ...state,
        selected: state.focused,
      };

    default:
      return state;
  }
}
