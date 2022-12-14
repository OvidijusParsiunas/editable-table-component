import {StringDimensionUtils, SuccessResult} from '../tableDimensions/stringDimensionUtils';
import {EditableTableComponent} from '../../editable-table-component';
import {TableElement} from '../../elements/table/tableElement';
import {OverflowInternal} from '../../types/overflowInternal';
import {CSSStyle} from '../../types/cssStyle';
import {Overflow} from '../../types/overflow';
import {Browser} from '../browser/browser';

export class OverflowUtils {
  private static ID = 'overflow-container';
  private static SCROLLBAR_WIDTH = 15;

  public static isOverflowElement(element?: HTMLElement) {
    return element?.id === OverflowUtils.ID;
  }

  // a simple way to not take the border into consideration when doing table width calculation, however if there are issues
  // feel free to investigate a better way
  public static unsetBorderDimensions(numberDimension: SuccessResult) {
    numberDimension.number -= TableElement.BORDER_DIMENSIONS.leftWidth + TableElement.BORDER_DIMENSIONS.rightWidth;
    TableElement.changeStaticWidthTotal(-TableElement.BORDER_DIMENSIONS.leftWidth);
    TableElement.changeStaticWidthTotal(-TableElement.BORDER_DIMENSIONS.rightWidth);
    TableElement.BORDER_DIMENSIONS.leftWidth = 0;
    TableElement.BORDER_DIMENSIONS.rightWidth = 0;
    TableElement.BORDER_DIMENSIONS.topWidth = 0;
    TableElement.BORDER_DIMENSIONS.bottomWidth = 0;
  }

  public static processNumberDimension(numberDimension: SuccessResult) {
    OverflowUtils.unsetBorderDimensions(numberDimension);
    numberDimension.number -= OverflowUtils.SCROLLBAR_WIDTH;
  }

  private static moveBorderToOverlay(tableStyle: CSSStyle, overflowContainer: HTMLElement, tableElement: HTMLElement) {
    overflowContainer.style.border = tableStyle.border as string;
    tableElement.style.border = '';
  }

  private static adjustStyleForScrollbarWidth(overflowContainer: HTMLElement, overflow: Overflow) {
    if (Browser.IS_SAFARI || Browser.IS_FIREFOX) {
      if (overflow.maxHeight && !overflow.maxWidth) {
        // this is used to not create a horizontal scroll
        overflowContainer.style.paddingRight = `${OverflowUtils.SCROLLBAR_WIDTH}px`;
      }
    }
  }

  private static setDimensions(overflowContainer: HTMLElement, {width, height}: {width: number; height: number}) {
    if (width) {
      overflowContainer.style.overflowX = 'auto';
      overflowContainer.style.maxWidth = `${width}px`;
    }
    if (height) {
      overflowContainer.style.overflowY = 'auto';
      overflowContainer.style.maxHeight = `${height}px`;
    }
  }

  // prettier-ignore
  private static getDimensions(etc: EditableTableComponent, overflow: Overflow, overflowInternal: OverflowInternal) {
    const widthResult = StringDimensionUtils.generateNumberDimensionFromClientString(
      'maxWidth', etc.parentElement as HTMLElement, overflow, true) || {number: 0, isPercentage: false};
    widthResult.number -= TableElement.BORDER_DIMENSIONS.leftWidth + TableElement.BORDER_DIMENSIONS.rightWidth;
    if (widthResult.isPercentage) overflowInternal.isWidthPercentage = true;
    // if heightResult is 0 for a %, the likelyhood is that the parent element does not have height set
    const heightResult = StringDimensionUtils.generateNumberDimensionFromClientString(
      'maxHeight', etc.parentElement as HTMLElement, overflow, false) || {number: 0, isPercentage: false};
    heightResult.number -= TableElement.BORDER_DIMENSIONS.topWidth + TableElement.BORDER_DIMENSIONS.bottomWidth;
    if (heightResult.isPercentage) overflowInternal.isHeightPercentage = true;
    return {width: widthResult.number, height: heightResult.number};
  }

  public static applyDimensions(etc: EditableTableComponent) {
    if (!etc.overflow || !etc.overflowInternal) return;
    const dimensions = OverflowUtils.getDimensions(etc, etc.overflow, etc.overflowInternal);
    OverflowUtils.setDimensions(etc.overflowInternal.overflowContainer, dimensions);
    OverflowUtils.adjustStyleForScrollbarWidth(etc.overflowInternal.overflowContainer, etc.overflow);
  }

  public static setupContainer(etc: EditableTableComponent, tableElement: HTMLElement) {
    const overflowContainer = document.createElement('div');
    etc.overflowInternal = {overflowContainer};
    overflowContainer.id = OverflowUtils.ID;
    OverflowUtils.moveBorderToOverlay(etc.tableStyle, overflowContainer, tableElement);
    overflowContainer.appendChild(tableElement);
  }
}
