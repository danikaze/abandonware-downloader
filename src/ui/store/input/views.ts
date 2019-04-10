import { DispatchType } from '../actions';
import { KeyData } from '.';
import { ChangeView, changeView } from '../actions/views';

const actions: { [key: string]: () => ChangeView } = {
  f2: () => changeView('gameList'),
  f3: () => changeView('crawler'),
};

/**
 * Key handler for changing the views of the main screen
 */
export function viewsKeyHandler(dispatch: DispatchType, key: KeyData): void | boolean {
  const action = actions[key.name];

  if (action) {
    dispatch(action());
    return true;
  }

  return false;
}
