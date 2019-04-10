import * as React from 'react';

import { Box } from 'ink';
import { GameList } from '../containers/game-list';
import { Filter } from '../containers/filter';
import { ViewStateProps } from './main-app';

export function ViewGameList(props: ViewStateProps) {
  return (
    <Box flexDirection='column' width='100%' height={props.height}>
      <Box margin={1}>
        <Filter gameModel={props.gameModel} />
      </Box>

      <Box>
        <GameList />
      </Box>
    </Box>
  );
}
