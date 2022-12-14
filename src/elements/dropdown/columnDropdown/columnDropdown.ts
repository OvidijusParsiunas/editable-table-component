import {DropdownItemHighlightUtils} from '../../../utils/color/dropdownItemHighlightUtils';
import {FullTableOverlayElement} from '../../fullTableOverlay/fullTableOverlayElement';
import {ColumnSettingsUtils} from '../../../utils/columnSettings/columnSettingsUtils';
import {GenericElementUtils} from '../../../utils/elements/genericElementUtils';
import {DropdownDisplaySettings} from '../../../types/dropdownDisplaySettings';
import {ElementVisibility} from '../../../utils/elements/elementVisibility';
import {CellHighlightUtils} from '../../../utils/color/cellHighlightUtils';
import {EditableTableComponent} from '../../../editable-table-component';
import {ElementOffset} from '../../../utils/elements/elementOffset';
import {DropdownItemNavigation} from '../dropdownItemNavigation';
import {ColumnTypeDropdownItem} from './columnTypeDropdownItem';
import {ColumnDropdownEvents} from './columnDropdownEvents';
import {ColumnDropdownItem} from './columnDropdownItem';
import {Browser} from '../../../utils/browser/browser';
import {TableElement} from '../../table/tableElement';
import {DropdownItem} from '../dropdownItem';
import {PX} from '../../../types/dimensions';
import {SIDE} from '../../../types/side';
import {Dropdown} from '../dropdown';

export class ColumnDropdown {
  private static resetDropdownPosition(dropdownElement: HTMLElement) {
    dropdownElement.style.left = '';
  }

  // prettier-ignore
  public static processTextAndHide(etc: EditableTableComponent) {
    const {activeOverlayElements, columnsDetails, focusedElements: {cell: {element: cellElement, columnIndex}}} = etc;
    const {columnDropdown, columnTypeDropdown, fullTableOverlay} = activeOverlayElements;
    if (!columnDropdown || !fullTableOverlay || !columnTypeDropdown || !cellElement) return;
    if (GenericElementUtils.doesElementExistInDom(cellElement)) {
      ColumnSettingsUtils.changeColumnSettingsIfNameDifferent(etc, cellElement, columnIndex as number);
    }
    CellHighlightUtils.fade(cellElement, columnsDetails[columnIndex as number]?.headerStateColors.default);
    Dropdown.hide(columnDropdown, fullTableOverlay, columnTypeDropdown);
    ColumnTypeDropdownItem.reset(columnTypeDropdown);
    ColumnDropdown.resetDropdownPosition(columnDropdown);
    ColumnDropdownItem.resetItems(columnDropdown);
    DropdownItemHighlightUtils.fadeCurrentlyHighlighted(activeOverlayElements);
  }

  public static create(etc: EditableTableComponent) {
    const dropdownElement = Dropdown.createBase();
    ColumnDropdownEvents.set(etc, dropdownElement);
    DropdownItem.addInputItem(etc, dropdownElement);
    ColumnDropdownItem.addItems(etc, dropdownElement);
    return dropdownElement;
  }

  public static getDropdownTopPosition(cellElement: HTMLElement, openedViaOverlayClick?: boolean): PX {
    if (openedViaOverlayClick) {
      const offsetTop = 1;
      return `${Browser.IS_FIREFOX ? offsetTop + TableElement.BORDER_DIMENSIONS.topWidth : offsetTop}px`;
    }
    return `${ElementOffset.processTop(cellElement.offsetTop + cellElement.offsetHeight)}px`;
  }

  private static getLeftPropertyToCenterDropdown(cellElement: HTMLElement) {
    const leftOffset = ElementOffset.processLeft(cellElement.offsetLeft + cellElement.offsetWidth / 2);
    return `${leftOffset - Dropdown.DROPDOWN_WIDTH / 2}px`;
  }

  // prettier-ignore
  private static displayAndSetDropdownPosition(cellElement: HTMLElement, dropdownElement: HTMLElement,
      openMethod: DropdownDisplaySettings['openMethod'], isHeaderSticky: boolean) {
    dropdownElement.style.left = ColumnDropdown.getLeftPropertyToCenterDropdown(cellElement);
    dropdownElement.style.top = ColumnDropdown.getDropdownTopPosition(cellElement, openMethod?.overlayClick);
    // needs to be displayed here to evalute if in view port
    Dropdown.display(dropdownElement);
    const visibilityDetails = ElementVisibility.getDetailsInWindow(dropdownElement);
    if (!visibilityDetails.isFullyVisible) {
      if (visibilityDetails.blockingSides.has(SIDE.LEFT)) {
        dropdownElement.style.left = '0px';
      } else if (visibilityDetails.blockingSides.has(SIDE.RIGHT)) {
        dropdownElement.style.left = `${cellElement.offsetLeft + cellElement.offsetWidth - Dropdown.DROPDOWN_WIDTH}px`;
      } else if (visibilityDetails.blockingSides.has(SIDE.TOP) && isHeaderSticky) {
        Dropdown.correctTopPositionForStickyHeader(cellElement, dropdownElement, !!openMethod?.cellClick);
      }
    }
  }

  // prettier-ignore
  private static displayAndSetPositionForOverflow(etc: EditableTableComponent, cellElement: HTMLElement,
      dropdownElement: HTMLElement) {
    const {tableElementRef, overflowInternal} = etc;
    if (!tableElementRef || !overflowInternal?.overflowContainer) return;
    const overflowElement = overflowInternal.overflowContainer;
    dropdownElement.style.left = ColumnDropdown.getLeftPropertyToCenterDropdown(cellElement);
    dropdownElement.style.top = `${etc.columnDropdownDisplaySettings.openMethod?.overlayClick
      ? overflowElement.scrollTop + 1 : overflowElement.scrollTop + cellElement.offsetHeight}px`;
    // needs to be displayed here to evalute if scrollwidth has appeared
    Dropdown.display(dropdownElement);
    if (tableElementRef.offsetWidth !== overflowElement.scrollWidth) {
      dropdownElement.style.left = `${tableElementRef.offsetWidth - dropdownElement.offsetWidth}px`;
    } else if (dropdownElement.offsetLeft < 0) {
      dropdownElement.style.left = '0px';
    }
  }

  // prettier-ignore
  public static display(etc: EditableTableComponent, columnIndex: number) {
    const dropdownElement = etc.activeOverlayElements.columnDropdown as HTMLElement;
    const cellElement = etc.columnsDetails[columnIndex].elements[0];
    ColumnDropdownItem.setUp(etc, dropdownElement, columnIndex, cellElement);
    if (etc.overflowInternal) {
      ColumnDropdown.displayAndSetPositionForOverflow(etc, cellElement, dropdownElement);
    } else {
      ColumnDropdown.displayAndSetDropdownPosition(cellElement, dropdownElement,
        etc.columnDropdownDisplaySettings.openMethod, etc.stickyProps.header); 
    }
    const inputElement = DropdownItem.getInputElement(dropdownElement);
    if (inputElement) DropdownItemNavigation.focusInputElement(inputElement as HTMLElement);
    FullTableOverlayElement.display(etc);
  }
}
