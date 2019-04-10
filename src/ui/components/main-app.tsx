import * as React from 'react';
import { AppTitle } from './app-title';
import { Footer } from './footer';
import { ViewCrawler } from './view-crawler';
import { ViewGameList } from './view-game-list';
import { Game } from '../../model/game';
import { ViewTypes } from '../store/model';

export interface StateProps {
  empty: boolean;
  width: number;
  height: number;
  gameModel: Game;
  view: ViewTypes;
}

export interface ViewStateProps {
  width: number;
  height: number;
  gameModel: Game;
  view: ViewTypes;
}

const viewComponentsMap: { [view in ViewTypes]: React.FunctionComponent<ViewStateProps> } = {
  crawler: ViewCrawler,
  gameList: ViewGameList,
};

export function MainApp(props: StateProps) {
  if (props.empty) {
    return null;
  }

  const ViewComponent = viewComponentsMap[props.view];
  const componentProps: ViewStateProps = {
    width: props.width,
    height: Math.floor(props.height / 2),
    gameModel: props.gameModel,
    view: props.view,
  };

  return (
    <>
      <AppTitle width={props.width}>
        abandonware-dl
      </AppTitle>

      <ViewComponent {...componentProps} />

      <Footer width={props.width} />
    </>
  );
}
