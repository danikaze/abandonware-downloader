import { Exit, ResizeWindow } from './window';
import { GameListAction } from './game-list';

export type Action = Exit
                   | ResizeWindow
                   | GameListAction
                   ;
