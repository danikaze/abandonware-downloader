import { Action } from 'redux';
import { ViewTypes } from '../model';

export type ViewsAction = ChangeView;

export interface ChangeView extends Action {
  type: 'changeView';
  view: ViewTypes;
}

export function changeView(view: ViewTypes): ChangeView {
  return {
    view,
    type: 'changeView',
  };
}
