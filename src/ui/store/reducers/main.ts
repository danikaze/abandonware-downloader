import { State } from '../model';
import { Action } from '../actions';

export function mainReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'exit': {
      return {
        ...state,
        exit: true,
      };
    }

    case 'resizeWindow':
      return {
        ...state,
        ui: {
          ...state.ui,
          width: action.width,
          height: action.height,
        },
      };

    default:
      return state;
  }
}
