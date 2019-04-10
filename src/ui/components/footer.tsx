import * as React from 'react';
import { Color, Box } from 'ink';
import { ViewTypes } from '../store/model';

export interface StateProps {
  width: number;
  view: ViewTypes;
}

export function Footer(props: StateProps): JSX.Element {
  const { width, view } = props;
  const texts: { view: ViewTypes, text: string }[] = [
    { view: 'gameList', text: '[F2] Local Game list' },
    { view: 'crawler', text: '[F3] Crawler' },
  ];
  const separator = '  |  ';

  const textLength = texts.reduce((acc, item) => acc + item.text.length, 0) + separator.length * (texts.length - 1);
  const leftLength = Math.floor((width - textLength) / 2);
  const rightLength = width - textLength - leftLength;

  const res = [
    <Color key='left' bgBlackBright>{' '.repeat(leftLength)}</Color>,
  ];

  texts.forEach((item, i) => {
    res.push(
      <Color key={item.view} bgBlackBright bold={item.view === view}>{item.text}</Color>
    );
    if (i !== texts.length - 1) {
      res.push(
        <Color key={`sep-${item.view}`} bgBlackBright>{separator}</Color>
      );
    }
  });

  res.push(
    <Color key='right' bgBlackBright>{' '.repeat(rightLength)}</Color>
  );

  return <Box>{res}</Box>;
}
