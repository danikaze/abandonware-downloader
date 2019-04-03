import * as readline from 'readline';
import { DispatchType } from '../store/actions';
import { createContainer, ContainerConfig } from '../../utils/create-container';
import { MainApp, StateProps } from '../components/main-app';
import { State } from '../store/model';
import { resizeWindow, exit } from '../store/actions/window';
import { KeyData, InputHandler, keyHandler } from '../store/input';
import { gameListKeyHandler } from '../store/input/game-list';

function init(dispatch: DispatchType): void {
  process.stdout.on('resize', () => {
    dispatch(resizeWindow());
  });

  const { stdin } = process;

  const rl = readline.createInterface(stdin)
  readline.emitKeypressEvents(stdin);
  if (stdin.isTTY) {
    stdin.setRawMode(true);
  }

  const exitHandler: InputHandler = (dispatch: DispatchType, key: KeyData) => {
    if (key.name === 'c' && key.ctrl) {
      rl.close();
      dispatch(exit());
      return true;
    }
  }

  stdin.on('keypress', keyHandler(
    dispatch,
    [
      exitHandler,
      gameListKeyHandler,
    ],
  ));
}

function mapStateToProps(state: State): StateProps {
  return {
    empty: state.exit,
    width: state.ui.width,
    height: state.ui.height,
  };
}

const config: ContainerConfig<State, StateProps> = {
  init,
  mapStateToProps,
  component: MainApp,
};

export const App = createContainer(config);
