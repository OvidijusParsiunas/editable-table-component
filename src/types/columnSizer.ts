import {StatefulCSSS, CSSStyle} from './cssStyle';
import {PX} from './pxDimension';

export interface SizerMoveLimits {
  left: number;
  right: number;
  currentOffset: number;
}

// these are styles that are dynamic and also depend on the column index
export interface ColumnSizerStyles {
  default: {
    // this is dynamic as it can depend on the index of the column this is on
    backgroundImage: string;
    width: PX;
  };
  hover: {
    width: PX;
  };
  static: {
    // using margin right to help center the sizers because movable sizer is using the offsetLeft for the callculation
    // of the new width which would marginLeft interfer with
    // the reason why it is stored in state is because it involves a calculation with a result that can change
    // depending on the index that the column sizer is on
    marginRight: PX;
  };
}

export interface ColumnSizerT {
  element: HTMLElement;
  movableElement: HTMLElement;
  styles: ColumnSizerStyles;
  siblingCellsTotalWidth?: number;
  isSideCellHovered: boolean;
  isSizerHovered: boolean;
  isMouseUpOnSizer: boolean;
}

export type UserSetColumnSizerStyle = Omit<StatefulCSSS<Pick<CSSStyle, 'backgroundColor'>>, 'default'>;
