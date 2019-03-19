import { createStore, applyMiddleware } from "redux";
import thunkMiddleware from 'redux-thunk';

import { State } from "./model";
import { reducer } from "./reducers";

const defaultState: State = {

};

export function initializeStore(initialState: State = defaultState) {
    return createStore(reducer, initialState, applyMiddleware(thunkMiddleware));
}
