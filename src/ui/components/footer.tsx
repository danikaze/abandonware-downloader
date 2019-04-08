import * as React from 'react';
import { Color } from 'ink';

export interface StateProps {
  width: number;
}

export function Footer(props: StateProps): JSX.Element {
  const { width } = props;

  return (
    <Color bgBlackBright>
      {''.padEnd(width, ' ')}
    </Color>
  );
}
