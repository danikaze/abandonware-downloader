import { ThunkDispatch } from 'redux-thunk';
import { Exit, ResizeWindow } from './window';
import { GameListAction } from './game-list';
import { FilterAction } from './filter';
import { ModelAction } from './data';
import { State } from '../model';

export type Action = Exit
                   | ResizeWindow
                   | GameListAction
                   | FilterAction
                   | ModelAction
                   ;

export type DispatchType = ThunkDispatch<State, null, Action>;
