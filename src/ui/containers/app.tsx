import * as readline from 'readline';
import { Dispatch, Action } from 'redux';
import { createContainer, ContainerConfig } from '../../utils/create-container';
import { MainApp, StateProps } from '../components/main-app';
import { State } from '../store/model';
import { resizeWindow, exit } from '../store/actions/window';

function init(dispatch: Dispatch<Action<string>>): void {
  process.stdout.on('resize', () => {
    dispatch(resizeWindow());
  });

  const { stdin } = process;

  const rl = readline.createInterface(stdin)
  readline.emitKeypressEvents(stdin);
  if (stdin.isTTY) {
    stdin.setRawMode(true);
  }

  stdin.on('keypress', (str, key) => {
    if (key.name === 'c' && key.ctrl) {
      rl.close();
      dispatch(exit());
    }
  });
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
