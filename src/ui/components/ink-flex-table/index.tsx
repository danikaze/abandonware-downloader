import * as React from 'react';
import { Header } from './header';
import { Cell } from './cell';
import { Box } from 'ink';

export interface CellProps {
  children: string;
  row?: number;
  column: number;
  key: string;
}

export interface StateProps<T extends { key?: number | string } = {}> {
  data: Array<T>;
  /** Name to use for the headers instead of the data keys */
  headerNames?: { [key: string]: string };
  /**
   * If specified (list of keys), this will be the headers shown.
   * If ommited, all the keys (of the first data object) will be shown in an arbitrary order
   */
  headerOrder?: string[];
  /** Set to `true` to show the header when there's no data. `headerOrder` will be required */
  headerIfEmpty?: boolean;
  /** Custom component to use to render the header cell */
  headerComponent?: React.ComponentType<CellProps>;
  /** Custom component to use to render the data cell */
  cellComponent?: React.ComponentType<CellProps>;
  /** marginX to apply to the `cellComponent`s */
  cellMargin?: number;
}

export class FlexTable<T> extends React.Component<StateProps<T>> {
  public static defaultProps: Partial<StateProps> = {
    headerComponent: Header,
    cellComponent: Cell,
    cellMargin: 1,
  };

  public render(): JSX.Element {
    return (
      <Box flexDirection='column'>
        {this.renderHeaderRow()}
        {this.renderData()}
      </Box>
    );
  }

  /**
   * Render the data rows
   */
  private renderData(): JSX.Element[] {
    const keys = this.getHeaderKeys();
    const CellComponent = this.props.cellComponent;
    const marginX = this.props.cellMargin;

    const renderDataCell = (key: string, value: string, row: number, column: number) => (
      <Box key={key} textWrap='truncate-end' flexBasis='100%' marginX={marginX}>
        <CellComponent key={key} row={row} column={column}>{value}</CellComponent>
      </Box>
    );

    return this.props.data.map((data, rowN) => (
      <Box key={rowN}>
        {keys.map((key, columnN) => renderDataCell(key, data[key], rowN, columnN))}
      </Box>
    ));
  }

  /**
   * Render the header rows based on the provided Header element
   */
  private renderHeaderRow(): JSX.Element {
    const keys = this.getHeaderKeys();
    const HeaderComponent = this.props.headerComponent;
    const marginX = this.props.cellMargin;

    const renderDataCell = (key: string, value: string, column: number) => (
      <Box key={key} textWrap='truncate-end' flexBasis='100%' marginX={marginX}>
        <HeaderComponent key={key} column={column}>{value}</HeaderComponent>
      </Box>
    );

    return (
      <Box>
        {keys.map((key, columnN) => renderDataCell(key, this.getHeaderName(key), columnN))}
      </Box>
    );
  }

  /**
   * Given a key, return the name to display as a header cell
   */
  private getHeaderName(key: string): string {
    const { headerNames } = this.props;

    return headerNames ? headerNames[key] || key : key;
  }

  /**
   * Get a list of the header keys, in the desired order to show
   */
  private getHeaderKeys(): string[] {
    const { data, headerOrder, headerIfEmpty } = this.props;

    if (data.length === 0 && !headerIfEmpty) {
      return;
    }

    return headerOrder || Object.keys(data[0]);
  }
}
