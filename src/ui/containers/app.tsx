import * as readline from 'readline';
import { DispatchType } from '../store/actions';
import { createContainer, ContainerConfig } from '../../utils/create-container';
import { MainApp, StateProps } from '../components/main-app';
import { State } from '../store/model';
import { resizeWindow, exit } from '../store/actions/window';
import { InputHandler, keyHandler } from '../store/input';
import { gameListKeyHandler } from '../store/input/game-list';
import { Game } from '../../model/game';
import { updateGames } from '../store/actions/game-list';

export interface OwnProps {
  gameModel: Game;
}

function init(dispatch: DispatchType, stateProps: StateProps, state: State, ownProps: OwnProps): void {
  process.stdout.on('resize', () => {
    dispatch(resizeWindow());
  });

  const { stdin } = process;

  const rl = readline.createInterface(stdin);
  readline.emitKeypressEvents(stdin);
  if (stdin.isTTY) {
    stdin.setRawMode(true);
  }

  const exitHandler: InputHandler = (dispatch, key) => {
    if (key.name === 'escape' || (key.name === 'c' && key.ctrl)) {
      rl.close();
      dispatch(exit());
      return true;
    }
  };

  stdin.on('keypress', keyHandler(
    dispatch,
    [
      exitHandler,
      gameListKeyHandler,
    ],
  ));

  const filter = state.ui.filter;
  ownProps.gameModel.search({
    name: filter.text,
    limit: filter.limit,
    offset: filter.offset,
    orderBy: filter.orderBy,
    sortDesc: filter.sortDesc,
  }).then((games) => {
    dispatch(updateGames(games));
  });
}

function mapStateToProps(state: State, ownProps: OwnProps): StateProps {
  return {
    view: state.ui.view,
    empty: state.exit,
    width: state.ui.width,
    height: state.ui.height,
    gameModel: ownProps.gameModel,
  };
}

const config: ContainerConfig<State, StateProps, undefined, OwnProps> = {
  init,
  mapStateToProps,
  component: MainApp,
};

export const App = createContainer(config);
