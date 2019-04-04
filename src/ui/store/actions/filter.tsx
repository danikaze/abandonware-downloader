import { Action } from 'redux';

export type FilterAction = UpdateFilterText;

export interface UpdateFilterText extends Action {
  type: 'updateFilterText';
  text: string;
}

export function updateFilterText(text: string): UpdateFilterText {
  return {
    text,
    type: 'updateFilterText',
  };
}
