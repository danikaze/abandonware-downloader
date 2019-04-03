import { Dispatch, Action } from 'redux';
import { createContainer, ContainerConfig } from '../../utils/create-container';
import { MainApp, StateProps } from '../components/main-app';
import { State } from '../store/model';
import { resizeWindow } from '../store/actions/window';

function init(dispatch: Dispatch<Action<string>>): void {
  process.stdout.on('resize', () => {
    dispatch(resizeWindow());
  });
}

function mapStateToProps(state: State): StateProps {
  return {
    empty: false,
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
