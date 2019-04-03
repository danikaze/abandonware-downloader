import * as React from 'react';
import { Box } from 'ink';
import { AppTitle } from './app-title';
import { Footer } from './footer';
import { GameList } from '../containers/game-list';

export interface StateProps {
  empty: boolean;
  width: number;
  height: number;
}

export function MainApp(props: StateProps) {
  if (props.empty) {
    return null;
  }

  const APP_HEIGHT = Math.floor(props.height / 2);

  return (
    <>
      <AppTitle width={props.width}>
        abandonware-dl
      </AppTitle>

      <Box width='100%'>
        <Box height={APP_HEIGHT}>
            <GameList />
        </Box>
      </Box>

      <Footer width={props.width} />
    </>
  );
}
