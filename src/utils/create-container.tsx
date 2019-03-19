import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';

export interface ContainerConfig<State, StateProps, DispatchProps = undefined, OwnProps = {}> {
  component: React.ComponentType;
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
  let initialState;

  function mapStateToPropsWrapper(state) {
    initialState = state;
    const props = config.mapStateToProps.apply(config, arguments);
    const result = props ? { ...props } : {};
    return result;
  }

  function mapDispatchToPropsWrapper() {
    dispatch = arguments[0];
    return config.mapDispatchToProps && config.mapDispatchToProps.apply(config, arguments) || {};
  }

  function mergeProps(stateProps, dispatchProps, ownProps) {
    // call loadData if defined, only when creating the component (only in browser side)
    if (config.init && (typeof window !== 'undefined') && dispatch) {
      config.init(dispatch, stateProps, initialState, ownProps);
      // clear references, to avoid memory leaks
      initialState = null;
      dispatch = null;
    }

    // Filter ownProps
    return { ...stateProps, ...dispatchProps };
  }

  // Apply connect container
  const component = connect(
    config.mapStateToProps && mapStateToPropsWrapper,
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
