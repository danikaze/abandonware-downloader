import { Exit, ResizeWindow } from './window';
import { GameListAction } from './game-list';
import { FilterAction } from './filter'
import { Action as ReduxAction, Dispatch } from 'redux';

export type Action = Exit
                   | ResizeWindow
                   | GameListAction
                   | FilterAction
                   ;

export type DispatchType = Dispatch<ReduxAction<string>>;
