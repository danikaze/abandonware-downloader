import * as React from 'react';
import { Color } from 'ink';

export interface Props {
  width: number;
  children: string;
}

export function AppTitle(props: Props) {
  const text = props.children;
  const width = props.width;
  const middle = Math.floor((width - text.length) / 2) + text.length;

  return (
    <Color bgBlue white bold>
      {text.padStart(middle, ' ').padEnd(width, ' ')}
    </Color>
  );
}
