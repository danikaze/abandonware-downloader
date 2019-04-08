import { Action } from '../actions';
import { State, GameListState } from '../model';
import { clamp } from '../../../utils/clamp';

export function gameListReducer(state: State, action: Action): GameListState {
  const gameListState = state.ui.gameList;

  switch (action.type) {
    case 'moveFocusedGame':
      return {
        ...gameListState,
        focused: clamp(gameListState.focused + action.delta, 0, gameListState.games.length - 1),
      };

    case 'selectFocusedGame':
      return {
        ...gameListState,
        selected: gameListState.focused,
      };

    case 'updateGames': {
      return {
        ...gameListState,
        games: action.games,
      };
    }

    default:
      return gameListState;
  }
}
