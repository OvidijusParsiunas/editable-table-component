import {UpdateRowElement} from '../../utils/insertRemoveStructure/update/updateRowElement';
import {TableDimensionsInternal} from '../../types/tableDimensionsInternal';
import {ColumnSizerT, SelectedColumnSizerT} from '../../types/columnSizer';
import {ColumnSizerGenericUtils} from './utils/columnSizerGenericUtils';
import {EditableTableComponent} from '../../editable-table-component';
import {MovableColumnSizerElement} from './movableColumnSizerElement';
import {ColumnSizerSetWidth} from './utils/columnSizerSetWidth';
import {SEMI_TRANSPARENT_COLOR} from '../../consts/colors';
import {ColumnsDetailsT} from '../../types/columnDetails';
import {ColumnSizerElement} from './columnSizerElement';

export class ColumnSizerExtrinsicEvents {
  private static moveMovableElement(selectedColumnSizer: HTMLElement, columnsDetails: ColumnsDetailsT, newLeft: number) {
    const {columnSizer} = ColumnSizerGenericUtils.getSizerDetailsViaElementId(selectedColumnSizer.id, columnsDetails);
    columnSizer.movableElement.style.left = `${newLeft}px`;
  }

  // prettier-ignore
  public static windowMouseMove(etc: EditableTableComponent, newXMovement: number) {
    const {activeOverlayElements: {selectedColumnSizer}, columnsDetails} = etc;
    if (selectedColumnSizer) {
      const {moveLimits, element} = selectedColumnSizer;
      selectedColumnSizer.mouseMoveOffset += newXMovement;
      if (selectedColumnSizer.mouseMoveOffset >= moveLimits.left
          && selectedColumnSizer.mouseMoveOffset <= moveLimits.right) {
        ColumnSizerExtrinsicEvents.moveMovableElement(element, columnsDetails, selectedColumnSizer.mouseMoveOffset);
      }
    }
  }

  // prettier-ignore
  private static setWidth(selectedColumnSizer: SelectedColumnSizerT, tableElement: HTMLElement,
      tableDimensions: TableDimensionsInternal, leftHeader: HTMLElement, rightHeader?: HTMLElement) {
    ColumnSizerElement.unsetTransitionTime(selectedColumnSizer.element);
    ColumnSizerSetWidth.set(selectedColumnSizer, tableElement, tableDimensions, leftHeader, rightHeader);
  }

  // prettier-ignore
  private static mouseUp(etc: EditableTableComponent) {
    const {activeOverlayElements, columnsDetails, tableDimensionsInternal, tableElementRef} = etc;
    const selectedColumnSizer = activeOverlayElements.selectedColumnSizer as SelectedColumnSizerT;
    const {columnSizer, headerCell, sizerNumber} = ColumnSizerGenericUtils.getSizerDetailsViaElementId(
      selectedColumnSizer.element.id, columnsDetails);
    ColumnSizerExtrinsicEvents.setWidth(selectedColumnSizer, tableElementRef as HTMLElement, tableDimensionsInternal,
      headerCell, ColumnSizerGenericUtils.findNextResizableColumnHeader(columnsDetails, sizerNumber));
    MovableColumnSizerElement.hide(columnSizer.movableElement);
    UpdateRowElement.updateHeaderRowHeight(columnSizer.element.parentElement?.parentElement as HTMLElement);
  }

  private static setSizerStyleToHoverNoAnimation(columnSizer: ColumnSizerT, anotherColor?: string) {
    const {width} = columnSizer.styles.hover;
    ColumnSizerElement.setHoverStyle(columnSizer.element, width, false, anotherColor);
    ColumnSizerElement.unsetBackgroundImage(columnSizer.element);
  }

  private static mouseUpNotOnSizer(columnSizer: ColumnSizerT) {
    const {element: sizerElement, styles: sizerStyles, movableElement} = columnSizer;
    ColumnSizerExtrinsicEvents.setSizerStyleToHoverNoAnimation(columnSizer, movableElement.style.backgroundColor);
    // this kicks off the animation with the hover properties from above
    setTimeout(() => {
      ColumnSizerElement.setTransitionTime(sizerElement);
      ColumnSizerElement.unsetElementsToDefault(sizerElement, sizerStyles.default.width, false);
      ColumnSizerElement.hideWhenCellNotHovered(columnSizer, true);
    });
    // reset properties after the animation so we have the right properties for mouse enter
    setTimeout(() => {
      ColumnSizerElement.setBackgroundImage(sizerElement, sizerStyles.default.backgroundImage);
      ColumnSizerElement.setBackgroundColor(sizerElement, SEMI_TRANSPARENT_COLOR);
    }, ColumnSizerElement.TRANSITION_TIME_ML);
  }

  // if the user clicks mouse up on the table first - this will not be activated as columnSizer selected will be removed
  // prettier-ignore
  public static windowMouseUp(etc: EditableTableComponent) {
    const {columnSizer} = ColumnSizerGenericUtils.getSizerDetailsViaElementId(
      (etc.activeOverlayElements.selectedColumnSizer as SelectedColumnSizerT).element.id, etc.columnsDetails);
    ColumnSizerExtrinsicEvents.mouseUp(etc);
    ColumnSizerExtrinsicEvents.mouseUpNotOnSizer(columnSizer);
    delete etc.activeOverlayElements.selectedColumnSizer;
  }

  private static mouseUpOnSizer(columnSizer: ColumnSizerT) {
    ColumnSizerExtrinsicEvents.setSizerStyleToHoverNoAnimation(columnSizer);
    columnSizer.isMouseUpOnSizer = true;
    setTimeout(() => {
      columnSizer.isMouseUpOnSizer = false;
      ColumnSizerElement.setTransitionTime(columnSizer.element);
    });
  }

  // this method is used to get what exact element was clicked on as window events just returns the component as the target
  // prettier-ignore
  public static tableMouseUp(etc: EditableTableComponent, target: HTMLElement) {
    const selectedColumnSizer = etc.activeOverlayElements.selectedColumnSizer as SelectedColumnSizerT;
    const {columnSizer} = ColumnSizerGenericUtils.getSizerDetailsViaElementId(
      selectedColumnSizer.element.id, etc.columnsDetails);
    ColumnSizerExtrinsicEvents.mouseUp(etc);
    // when autorise happens - the sizer usually moves out of the cursor area
    if (MovableColumnSizerElement.isMovableColumnSizer(target) && !selectedColumnSizer.wasAutoresized) {
      ColumnSizerExtrinsicEvents.mouseUpOnSizer(columnSizer);
    } else {
      ColumnSizerExtrinsicEvents.mouseUpNotOnSizer(columnSizer);
    }
    delete etc.activeOverlayElements.selectedColumnSizer;
  }
}
