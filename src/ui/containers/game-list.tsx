import * as React from 'react';
import { Color } from 'ink';
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
    if (row === gameList.selected && row === gameList.focused) {
      return <Color yellowBright>{children}</Color>;
    }
    if (row === gameList.selected) {
      return <Color yellow>{children}</Color>;
    }
    if (row === gameList.focused) {
      return <Color white>{children}</Color>;
    }
    return <Color gray>{children}</Color>;
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
