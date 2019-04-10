import { ThunkDispatch } from 'redux-thunk';
import { Exit, ResizeWindow } from './window';
import { GameListAction } from './game-list';
import { FilterAction } from './filter';
import { State } from '../model';
import { ChangeView } from './views';

export type Action = Exit
                   | ResizeWindow
                   | ChangeView
                   | GameListAction
                   | FilterAction
                   ;

export type DispatchType = ThunkDispatch<State, null, Action>;
