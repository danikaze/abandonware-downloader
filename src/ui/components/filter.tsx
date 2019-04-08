import * as React from 'react';
import TextInput from 'ink-text-input';
import { Text } from 'ink';

export interface StateProps {
  text: string;
}

export interface DispatchProps {
  onChange(filter: string): void;
}

export function Filter(props: StateProps & DispatchProps): JSX.Element {
  return (
    <>
      <Text bold>Filter: </Text>
      <TextInput
        value={props.text}
        placeholder='Start typing to filter games'
        onChange={props.onChange}
      />
    </>
  );
}
