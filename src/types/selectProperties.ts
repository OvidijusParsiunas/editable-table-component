import {PX} from './dimensions';

export type SelectOptions = string[];

// if backgroundColor is not provided - a random one is generated
export type LabelOptions = {name: string; backgroundColor?: string}[];

export interface SelectDropdownOptionStyle {
  textColor: CSSStyleDeclaration['color'];
}

export interface SelectDropdownStyle {
  width?: PX;
  paddingTop?: PX;
  paddingBottom?: PX;
  textAlign?: CSSStyleDeclaration['textAlign'];
  border?: CSSStyleDeclaration['border'];
}

export interface SelectProperties<T = LabelOptions> {
  dropdownStyle?: SelectDropdownStyle;
  optionStyle?: SelectDropdownOptionStyle;
  options?: T;
  canAddMoreOptions?: boolean; // by default this is true or if options is set it is false
}
