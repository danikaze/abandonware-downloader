import { createContainer, ContainerConfig } from '../../utils/create-container';
import { State } from '../store/model';
import { DispatchType } from '../store/actions';
import { updateFilterText } from '../store/actions/filter';
import { Filter as component, DispatchProps, StateProps } from '../components/filter';
import { Game } from '../../model/game';

export interface OwnProps {
  gameModel: Game;
}

function mapDispatchToProps(dispatch: DispatchType, ownProps: OwnProps): DispatchProps {
  return {
    onChange: (text) => dispatch(updateFilterText(text, ownProps.gameModel)),
  };
}

function mapStateToProps(state: State): StateProps {
  return {
    text: state.ui.filter.text,
  };
}

const config: ContainerConfig<State, StateProps, DispatchProps, OwnProps> = {
  component,
  mapStateToProps,
  mapDispatchToProps,
};

export const Filter = createContainer(config);
