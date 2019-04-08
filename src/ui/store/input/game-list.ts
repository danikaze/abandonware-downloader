import { DispatchType } from '../actions';
import { KeyData } from '.';
import { moveFocusedGame, selectFocusedGame, GameListAction } from '../actions/game-list';

const actions: { [key: string]: () => GameListAction } = {
  up: () => moveFocusedGame(-1),
  down: () => moveFocusedGame(1),
  return: () => selectFocusedGame(),
  space: () => selectFocusedGame(),
};

/**
 * Key handler for the GameList container
 */
export function gameListKeyHandler(dispatch: DispatchType, key: KeyData): void | boolean {
  const action = actions[key.name];

  if (action) {
    dispatch(action());
    return true;
  }

  return false;
}
