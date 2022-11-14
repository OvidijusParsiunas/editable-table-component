import {StaticTableWidthUtils} from '../../../../utils/tableDimensions/staticTable/staticTableWidthUtils';
import {MaximumColumns} from '../../../../utils/insertRemoveStructure/insert/maximumColumns';
import {GenericElementUtils} from '../../../../utils/elements/genericElementUtils';
import {EditableTableComponent} from '../../../../editable-table-component';
import {AddNewColumnEvents} from './addNewColumnEvents';
import {CellElement} from '../../../cell/cellElement';
import {TableElement} from '../../tableElement';

export class AddNewColumnElement {
  public static readonly ADD_COLUMN_CELL_CLASS = 'add-column-cell';
  public static readonly DEFAULT_WIDTH = 20;
  private static readonly DEFAULT_WIDTH_PX = `${AddNewColumnElement.DEFAULT_WIDTH}px`;

  // the toggling of the add new column element is not a simple display style change because the following selector:
  // .row > .cell:last-of-type which is responsible for not adding a right-border for the rightmost cell can only
  // detect the last .cell element, so when this button is displayed we want the selector to recognise it and
  // not display a border on the right and not affect the css of the cell before it. When it is not displayed,
  // we want the previous cell to be recognised by the selector. Unfortunately this is not possible as even
  // renaming the class names on this button does not re-trigger selector to identify the previous cell as last.
  // The only way to do this is to remove the cell element when not visible, which is what the code below is doing
  // and re-adding the cell when it is visible. (The cell still remains in the addColumnCellsElementsRef object).
  // prettier-ignore
  private static setDisplay(cell: HTMLElement, isDisplay: boolean,
      tableBodyElement: HTMLElement, rowIndex: number, columnGroupRef: HTMLElement) {
    if (isDisplay) {
      tableBodyElement.children[rowIndex].appendChild(cell);
    } else {
      cell.remove();
      // remove does not trigger mouse leave event, hence need to trigger it manually
      setTimeout(() => AddNewColumnEvents.toggleBackground(columnGroupRef, 'fade'))
    }
  }

  private static createCell(etc: EditableTableComponent, tag: 'th' | 'td') {
    const cell = document.createElement(tag);
    cell.classList.add(CellElement.CELL_CLASS, AddNewColumnElement.ADD_COLUMN_CELL_CLASS);
    Object.assign(cell.style, etc.cellStyle);
    AddNewColumnEvents.setEvents(etc, cell);
    return cell;
  }

  private static createHeaderCell(etc: EditableTableComponent) {
    const headerCell = AddNewColumnElement.createCell(etc, 'th');
    headerCell.style.width = AddNewColumnElement.DEFAULT_WIDTH_PX;
    headerCell.textContent = '+';
    Object.assign(headerCell.style, etc.headerStyle);
    return headerCell;
  }

  private static createDataCell(etc: EditableTableComponent) {
    return AddNewColumnElement.createCell(etc, 'td');
  }

  public static createAndAppendToRow(etc: EditableTableComponent, rowElement: HTMLElement, rowIndex: number) {
    const cell = rowIndex === 0 ? AddNewColumnElement.createHeaderCell(etc) : AddNewColumnElement.createDataCell(etc);
    etc.addColumnCellsElementsRef.splice(rowIndex, 0, cell);
    rowElement.appendChild(cell);
  }

  private static isDisplayed(addColumnCellsElementsRef: HTMLElement[]) {
    return GenericElementUtils.doesElementExistInDom(addColumnCellsElementsRef[0]);
  }

  public static toggle(etc: EditableTableComponent, isInsert: boolean) {
    const {addColumnCellsElementsRef, tableBodyElementRef, columnGroupRef, displayAddColumnCell} = etc;
    if (!displayAddColumnCell || !tableBodyElementRef || !columnGroupRef) return;
    const canAddMore = MaximumColumns.canAddMore(etc);
    // do not toggle if already in the intended state
    if (canAddMore === AddNewColumnElement.isDisplayed(addColumnCellsElementsRef)) return;
    addColumnCellsElementsRef.forEach((cell, rowIndex) =>
      AddNewColumnElement.setDisplay(cell, canAddMore, tableBodyElementRef, rowIndex, columnGroupRef)
    );
    TableElement.changeAuxiliaryTableContentWidth(
      canAddMore ? AddNewColumnElement.DEFAULT_WIDTH : -AddNewColumnElement.DEFAULT_WIDTH
    );
    StaticTableWidthUtils.changeWidthsBasedOnColumnInsertRemove(etc, isInsert);
  }
}