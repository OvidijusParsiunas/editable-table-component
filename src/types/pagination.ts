import {CSSStyle, StatefulCSSS} from './cssStyle';

export type PaginationPosition =
  | 'top-left'
  | 'top-middle'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-middle'
  | 'bottom-right';

export interface PaginationPositions {
  container?: PaginationPosition;
}

export interface ContainerStyle {
  border?: string;
  margin?: string;
  marginTop?: string;
  marginLeft?: string;
  marginRight?: string;
  marginBottom?: string;
  float?: 'right' | 'left' | '';
}

type ActionButtonStyle<T> = T & {
  previousText?: string;
  nextText?: string;
  firstText?: string;
  lastText?: string;
};

export interface PaginationStyle<T> {
  container?: ContainerStyle;
  buttons?: T;
  activeButton?: T;
  disabledButtons?: CSSStyle; // disabled buttons do not have any mouse events
  actionButtons?: ActionButtonStyle<T>; // will also use 'buttons' style
}

export interface Pagination {
  numberOfRows?: number; // by default set to 10
  maxNumberOfButtons?: number; // by default set to 8
  displayPrevNext?: boolean; // by default true
  displayFirstLast?: boolean; // by default true
  displayNumberOfVisibleRows?: boolean; // by default true
  displayNumberOfRowsOptions?: number[];
  style?: PaginationStyle<StatefulCSSS>;
  positions?: PaginationPositions;
}