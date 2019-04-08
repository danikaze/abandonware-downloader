import { DispatchType } from '../actions';

export interface KeyData {
  code: string;
  name: string;
  sequence: string;
  ctrl: boolean;
  meta: boolean;
  shift: boolean;
}

export type InputHandler = (dispatch: DispatchType, key: KeyData) => void | boolean;

/**
 * Accept a list of handlers to process the key input event.
 * If any of the handlers return `true`, the event it's not passed to the next one
 */
export function keyHandler(dispatch, handlers: InputHandler[]): (str: string, key: KeyData) => void {
  return (str, key) => {
    for (const handler of handlers) {
      if (handler(dispatch, key)) {
        return;
      }
    }
  };
}
