import * as React from 'react';
import TextInput from 'ink-text-input';
import { Text, Box } from 'ink';

export interface StateProps {
  text: string;
}

export interface DispatchProps {
  onChange(filter: string): void;
}

export function Filter(props: StateProps & DispatchProps): JSX.Element {
  return (
    <Box margin={1}>
        <Text bold>Filter: </Text>
        <TextInput
          value={props.text}
          placeholder='Start typing to filter games'
          onChange={props.onChange}
        />
      </Box>
  );
}
