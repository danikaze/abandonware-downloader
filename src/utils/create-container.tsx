import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';

export interface ContainerConfig<State, StateProps, DispatchProps = undefined, OwnProps = {}> {
  component: ((props: StateProps) => JSX.Element) | React.ComponentType<StateProps>;
  mapDispatchToProps?: (dispatch: Dispatch<Action<string>>, ownProps?: OwnProps) => DispatchProps;
  mapStateToProps?: (state: State, ownProps?: OwnProps) => StateProps;
  /** If defined, `init` would be triggered once, when creating the component */
  init?: (dispatch: Dispatch<Action<string>>, stateProps?: StateProps, state?: State, ownProps?: OwnProps) => void;
}

export function createContainer<State, StateProps, DispatchProps, OwnProps>(
  config: ContainerConfig<State, StateProps, DispatchProps, OwnProps>
): React.ComponentClass<OwnProps> {
  /** reference to dispatch function */
  let dispatch: Dispatch<Action<string>>;
  /** reference to the state at the moment of creating the component */
  let initialState: State;

  function mapStateToPropsWrapper(state) {
    initialState = state;
    const props = config.mapStateToProps.apply(config, arguments);
    return props ? props : {};
  }

  function mapStateToPropsWithOwnPropsWrapper(state, ownProps) {
    initialState = state;
    const props = config.mapStateToProps.apply(config, arguments);
    return props ? props : {};
  }

  function mapDispatchToPropsWrapper() {
    dispatch = arguments[0];
    return config.mapDispatchToProps && config.mapDispatchToProps.apply(config, arguments) || {};
  }

  function mergeProps(stateProps, dispatchProps, ownProps) {
    // call loadData if defined, only when creating the component
    if (config.init && dispatch) {
      config.init(dispatch, stateProps, initialState, ownProps);
      // clear references, to avoid memory leaks
      initialState = null;
      dispatch = null;
    }

    // Filter ownProps
    return { ...stateProps, ...dispatchProps };
  }

  let ms2p;
  const mapStateToProps = config.mapStateToProps;
  if (mapStateToProps) {
    ms2p = mapStateToProps.length > 1 ? mapStateToPropsWithOwnPropsWrapper : mapStateToPropsWrapper;
  }

  // Apply connect container
  const component = connect(
    ms2p,
    mapDispatchToPropsWrapper,
    mergeProps,
  )((props) => {
    const VisualComponent = config.component;

    return Object.keys(props).length
      ? <VisualComponent {...props} />
      : null;
  });
  return component;
}
