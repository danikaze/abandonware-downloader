import * as React from 'react';
import { ViewStateProps } from './main-app';
import { Box } from 'ink';

export function ViewCrawler(props: ViewStateProps) {
  return (
    <Box flexDirection='column' width='100%' height={props.height}>
      <Box margin={1}>
        Crawler View
      </Box>
    </Box>
  );
}
