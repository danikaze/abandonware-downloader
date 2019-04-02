import { Action } from 'redux';

export interface ResizeWindow extends Action {
  type: 'resizeWindow';
  width: number;
  height: number;
}

export interface Exit extends Action {
  type: 'exit';
}

export function resizeWindow(): ResizeWindow {
  return {
    type: 'resizeWindow',
    width: process.stdout.columns,
    height: process.stdout.rows,
  };
}

export function exit(): Exit {
  return {
    type: 'exit',
  };
}
