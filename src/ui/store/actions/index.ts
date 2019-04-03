import { Exit, ResizeWindow } from './window';
import { GameListAction } from './game-list';
import { Dispatch } from 'redux';

export type Action = Exit
                   | ResizeWindow
                   | GameListAction
                   ;

export type DispatchType = Dispatch<Action>;
