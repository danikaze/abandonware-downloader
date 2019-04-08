import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';

import { State } from './model';
import { reducer } from './reducers';
import { defaultState } from './default-state';

export function initializeStore(initialState: State = defaultState) {
  return createStore(reducer, initialState, applyMiddleware(thunkMiddleware));
}
