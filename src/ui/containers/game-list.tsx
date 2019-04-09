import * as React from 'react';
import { ColorPipe } from 'ink-color-pipe';
import { createContainer, ContainerConfig } from '../../utils/create-container';
import { State } from '../store/model';
import { FlexTable, StateProps, CellProps } from '../components/ink-flex-table';

interface GameListInfo {
  key: number;
  name: string;
  year: number;
  platform: string;
}

function mapStateToProps(state: State): StateProps<GameListInfo> {
  const { gameList } = state.ui;

  function Cell({ children, row }: CellProps) {
    let color = 'grey';

    switch (true) {
      case row === gameList.selected && row === gameList.focused:
        color = 'yellowBright';
        break;
      case row === gameList.selected:
        color = 'yellow';
        break;
      case row === gameList.focused:
        color = 'white';
        break;
    }

    return <ColorPipe styles={color}>{children}</ColorPipe>;
  }

  return {
    data: gameList.games.map((game) => ({
      key: game.id,
      year: game.year,
      name: game.name,
      platform: game.platform,
    })),
    headerOrder: gameList.columns,
    headerIfEmpty: true,
    cellComponent: Cell,
  };
}

const config: ContainerConfig<State, StateProps> = {
  mapStateToProps,
  component: FlexTable,
};

export const GameList = createContainer(config);
