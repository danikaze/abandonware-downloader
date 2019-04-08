import * as React from 'react';
import { Color } from 'ink';
import { CellProps } from '.';

export function Header({ children }: CellProps) {
  return (
    <Color bold blueBright>{children}</Color>
  );
}
