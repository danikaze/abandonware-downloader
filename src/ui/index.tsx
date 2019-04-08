import * as React from 'react';
import { Provider } from 'react-redux';

import { render } from 'ink';
import { App } from './containers/app';
import { initializeStore } from './store';
import { Game } from '../model/game';

export interface UiAppOptions {
  gameModel: Game;
}

/**
 * Launch the UI for the app
 * Resolves when finished
 */
export function start(options: UiAppOptions): Promise<void> {
  const store = initializeStore();
  const { waitUntilExit, unmount } = render(
    <Provider store={store}>
      <App gameModel={options.gameModel} />
    </Provider>
  );

  store.subscribe(() => {
    if (store.getState().exit) {
      unmount();
    }
  });

  return waitUntilExit();
}
