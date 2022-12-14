import {ColumnSettingsUtils} from '../columnSettings/columnSettingsUtils';
import {EditableTableComponent} from '../../editable-table-component';
import {FocusedCellUtils} from '../focusedElements/focusedCellUtils';
import {CustomRowProperties} from '../rows/customRowProperties';
import {PaginationUtils} from '../pagination/paginationUtils';
import {CellElement} from '../../elements/cell/cellElement';
import {FocusedCell} from '../../types/focusedCell';
import {MoveUtils} from './moveUtils';

export class MoveRow {
  // prettier-ignore
  private static overwrite(etc: EditableTableComponent, sourceText: string[], targetIndex: number) {
    const overwrittenText: string[] = [];
    etc.columnsDetails.forEach((columnDetails, columnIndex) => {
      const overwrittenDataText = MoveUtils.setNewElementText(etc, sourceText[columnIndex],
        columnDetails.elements[targetIndex], columnIndex, targetIndex);
      overwrittenText.push(overwrittenDataText);
    });
    return overwrittenText;
  }

  private static moveDataRows(etc: EditableTableComponent, targetRowIndex: number, siblingIndex: number) {
    const {columnsDetails} = etc;
    const siblingRowText = columnsDetails.map(({elements}) => CellElement.getText(elements[siblingIndex]));
    // overwrite current row using sibling row
    const overwrittenText = MoveRow.overwrite(etc, siblingRowText, targetRowIndex);
    // overwrite sibling row using overwritten row
    MoveRow.overwrite(etc, overwrittenText, siblingIndex);
  }

  private static resetFocusedCell(etc: EditableTableComponent, initialFocusedCell: Required<FocusedCell>) {
    const {auxiliaryTableContentInternal, focusedElements, columnsDetails} = etc;
    const {element, rowIndex, columnIndex} = initialFocusedCell;
    if (auxiliaryTableContentInternal.displayIndexColumn) {
      FocusedCellUtils.setIndexCell(focusedElements.cell, element, columnIndex);
    } else {
      FocusedCellUtils.set(focusedElements.cell, element, rowIndex, columnIndex, columnsDetails[columnIndex].types);
    }
  }

  private static moveHeaderToDataRow(etc: EditableTableComponent) {
    const {columnsDetails, focusedElements} = etc;
    const initialFocusedCell = {...focusedElements.cell} as Required<FocusedCell>;
    const dataRowText = columnsDetails.map(({elements}) => CellElement.getText(elements[1]));
    // overwrite header row using data row
    const overwrittenText = MoveRow.overwrite(etc, dataRowText, 0);
    // update header row settings
    columnsDetails.forEach((column, columnIndex) => {
      FocusedCellUtils.set(focusedElements.cell, column.elements[0], 0, columnIndex, column.types);
      ColumnSettingsUtils.changeColumnSettingsIfNameDifferent(etc, column.elements[0], columnIndex);
    });
    // overwrite data row using header row
    MoveRow.overwrite(etc, overwrittenText, 1);
    MoveRow.resetFocusedCell(etc, initialFocusedCell);
  }

  public static move(etc: EditableTableComponent, rowIndex: number, isToDown: boolean) {
    const siblingIndex = isToDown ? rowIndex + 1 : rowIndex - 1;
    if (rowIndex === 0 || siblingIndex === 0) {
      MoveRow.moveHeaderToDataRow(etc);
    } else {
      MoveRow.moveDataRows(etc, rowIndex, siblingIndex);
    }
    CustomRowProperties.update(etc, rowIndex);
    if (etc.pagination) PaginationUtils.updateOnRowMove(etc, siblingIndex);
  }
}
