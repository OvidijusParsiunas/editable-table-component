import {USER_SET_COLUMN_TYPE, ACTIVE_COLUMN_TYPE, DATE_COLUMN_TYPE, TEXT_DIV_COLUMN_TYPE} from '../../enums/columnType';
import {CategoryDropdownItem} from '../../elements/dropdown/categoryDropdown/categoryDropdownItem';
import {DateCellElement} from '../../elements/cell/cellsWithTextDiv/dateCell/dateCellElement';
import {CategoryCellElement} from '../../elements/cell/cellsWithTextDiv/categoryCellElement';
import {EditableTableComponent} from '../../editable-table-component';
import {DataCellElement} from '../../elements/cell/dataCellElement';
import {DisplayedCellTypeName} from './displayedCellTypeName';
import {ColumnsDetailsT} from '../../types/columnDetails';
import {CellEvents} from '../../elements/cell/cellEvents';
import {CellTypeTotalsUtils} from './cellTypeTotalsUtils';
import {VALIDABLE_CELL_TYPE} from '../../enums/cellType';
import {ValidateInput} from './validateInput';

export class UserSetCellType {
  // prettier-ignore
  private static purgeInvalidCell(etc: EditableTableComponent, columnsDetails: ColumnsDetailsT,
      rowIndex: number, columnIndex: number) {
    const relativeRowIndex = rowIndex + 1;
    const cellElement = columnsDetails[columnIndex].elements[relativeRowIndex];
    CellEvents.setCellToDefaultIfNeeded(etc, relativeRowIndex, columnIndex, cellElement, false);
  }

  private static purgeInvalidCells(etc: EditableTableComponent, columnIndex: number, newType: VALIDABLE_CELL_TYPE) {
    const {contents, columnsDetails} = etc;
    let updateTableEvent = false;
    contents.slice(1).forEach((row, rowIndex) => {
      const cellText = row[columnIndex] as string;
      if (!ValidateInput.validate(cellText, newType)) {
        UserSetCellType.purgeInvalidCell(etc, columnsDetails, rowIndex, columnIndex);
        updateTableEvent = true;
      }
    });
    if (updateTableEvent) etc.onTableUpdate(contents);
  }

  // prettier-ignore
  private static purgeInvalidCellsIfValidable(etc: EditableTableComponent,
      newTypeEnum: VALIDABLE_CELL_TYPE, columnIndex: number) {
    if (VALIDABLE_CELL_TYPE[newTypeEnum]) UserSetCellType.purgeInvalidCells(etc, columnIndex, newTypeEnum);
  }

  private static set(etc: EditableTableComponent, newTypeEnum: USER_SET_COLUMN_TYPE, columnIndex: number) {
    const columnDetails = etc.columnsDetails[columnIndex];
    const {cellTypeTotals, elements} = columnDetails;
    columnDetails.activeColumnType =
      newTypeEnum === USER_SET_COLUMN_TYPE.Auto
        ? CellTypeTotalsUtils.getActiveColumnType(cellTypeTotals, elements.length - 1)
        : ACTIVE_COLUMN_TYPE[newTypeEnum as keyof typeof ACTIVE_COLUMN_TYPE];
    columnDetails.userSetColumnType = newTypeEnum;
  }

  public static setIfNew(this: EditableTableComponent, newType: string, columnIndex: number) {
    const codeTypeName = DisplayedCellTypeName.get(newType); // from displayed name to code
    const newTypeEnumStr = USER_SET_COLUMN_TYPE[codeTypeName as keyof typeof USER_SET_COLUMN_TYPE];
    const previousTypeEnum = this.columnsDetails[columnIndex].userSetColumnType;
    if (newTypeEnumStr !== previousTypeEnum) {
      UserSetCellType.set(this, newTypeEnumStr, columnIndex);
      UserSetCellType.purgeInvalidCellsIfValidable(this, newTypeEnumStr as keyof typeof VALIDABLE_CELL_TYPE, columnIndex);
      if (TEXT_DIV_COLUMN_TYPE[previousTypeEnum] && !TEXT_DIV_COLUMN_TYPE[newTypeEnumStr]) {
        DataCellElement.convertColumnFromTextDivColumnToData(this, columnIndex);
      } else if (newTypeEnumStr === USER_SET_COLUMN_TYPE.Category) {
        CategoryDropdownItem.populateItems(this, columnIndex);
        // items need to be populated before we know what color each cell text needs to be turned into
        CategoryCellElement.convertColumnToCategoryType(this, columnIndex, previousTypeEnum);
      } else if (DATE_COLUMN_TYPE[newTypeEnumStr]) {
        DateCellElement.convertColumnTypeToDate(this, columnIndex, previousTypeEnum, newTypeEnumStr);
      }
    }
  }
}
