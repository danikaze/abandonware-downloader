import { Action } from '../actions';
import { State, FilterState } from '../model';

export function filterReducer(state: State, action: Action): FilterState {
  const filterState = state.ui.filter;

  switch (action.type) {
    case 'updateFilterText':
      return {
        ...filterState,
        text: action.text,
      };

    default:
      return filterState;
  }
}
