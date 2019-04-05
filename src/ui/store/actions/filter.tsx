import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { State } from '../model';
import { Game } from '../../../model/game';
import { updateGames, UpdateGameListAction } from './data';

export type FilterAction = UpdateFilterText;

export interface UpdateFilterText extends Action {
  type: 'updateFilterText';
  text: string;
}

type ThunkType = ThunkAction<Promise<void>, State, null, UpdateFilterText | UpdateGameListAction>;

export function updateFilterText(text: string, model: Game): ThunkType {
  return (dispatch, getState) => {
    dispatch({
      text,
      type: 'updateFilterText',
    });

    const filter = getState().ui.filter;
    return model.search({
      name: text,
      limit: filter.limit,
      offset: filter.offset,
      orderBy: filter.orderBy,
      sortDesc: filter.sortDesc,
    }).then((games) => {
      dispatch(updateGames(games));
    });
  };
}
