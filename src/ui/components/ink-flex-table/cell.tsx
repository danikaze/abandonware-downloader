import * as React from 'react';
import { Color } from 'ink';
import { CellProps } from '.';

export function Cell({ children }: CellProps) {
  return (
    <Color>{children}</Color>
  );
}
