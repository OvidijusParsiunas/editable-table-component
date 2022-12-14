import {AuxiliaryTableContentColors} from '../../utils/auxiliaryTableContent/auxiliaryTableContentColors';
import {ColumnSettingsBorderUtils} from '../../utils/columnSettings/columnSettingsBorderUtils';
import {GenericElementUtils} from '../../utils/elements/genericElementUtils';
import {EditableTableComponent} from '../../editable-table-component';
import {DEFAULT_COLUMN_WIDTH} from '../../consts/defaultColumnWidth';
import {ExtractElements} from '../../utils/elements/extractElements';
import {UpdateIndexColumnWidth} from './updateIndexColumnWidth';
import {Browser} from '../../utils/browser/browser';
import {CellElement} from '../cell/cellElement';

export class IndexColumn {
  public static readonly INDEX_CELL_CLASS = 'index-cell';
  // using overflow to detect a need for width update when display style 'block' property is not set
  public static readonly INDEX_CELL_OVERFLOW_CLASS = 'index-cell-overflow';
  public static readonly DEFAULT_WIDTH = DEFAULT_COLUMN_WIDTH;
  private static readonly DEFAULT_WIDTH_PX = `${IndexColumn.DEFAULT_WIDTH}px`;

  public static updateIndexes(etc: EditableTableComponent, startIndex: number) {
    const {tableBodyElementRef, contents} = etc;
    const textRowsArr = ExtractElements.textRowsArrFromTBody(tableBodyElementRef as HTMLElement, contents, startIndex);
    const auxiliaryPaddingIndex = Number(etc.auxiliaryTableContentInternal.indexColumnCountStartsAtHeader);
    textRowsArr.forEach((row, rowIndex) => {
      const indexCell = row.children[0] as HTMLElement;
      const relativeIndex = startIndex + rowIndex + auxiliaryPaddingIndex;
      indexCell.innerText = String(relativeIndex);
    });
    UpdateIndexColumnWidth.update(etc, textRowsArr.length === 0 ? undefined : textRowsArr);
  }

  // prettier-ignore
  private static createCell(etc: EditableTableComponent, isHeader: boolean) {
    const {tableDimensionsInternal, defaultColumnsSettings, auxiliaryTableContentInternal} = etc;
    const cell = CellElement.createBaseCell(isHeader);
    cell.classList.add(IndexColumn.INDEX_CELL_CLASS, GenericElementUtils.NOT_SELECTABLE_CLASS);
    const {displaySettings, isHeaderRowEditable} = etc.rowDropdownSettings;
    cell.style.cursor = displaySettings.openMethod?.cellClick && (!isHeader || isHeaderRowEditable)
      ? 'pointer' : 'default';
    if (!tableDimensionsInternal.isColumnIndexCellTextWrapped) {
      cell.classList.add(IndexColumn.INDEX_CELL_OVERFLOW_CLASS); // REF-19
    }
    Object.assign(cell.style, defaultColumnsSettings.cellStyle, auxiliaryTableContentInternal.styleProps?.default || {});
    if (isHeader) Object.assign(cell.style, AuxiliaryTableContentColors.CELL_COLORS.header.default);
    return cell;
  }

  private static createHeaderCell(etc: EditableTableComponent) {
    const headerCell = IndexColumn.createCell(etc, true);
    if (etc.auxiliaryTableContentInternal.indexColumnCountStartsAtHeader) headerCell.innerText = '1';
    headerCell.style.width = IndexColumn.DEFAULT_WIDTH_PX;
    // Safari does not always apply the width immediately, however do need the line above as it would otherwise cause
    // the table width to change when a row is removed
    if (Browser.IS_SAFARI) setTimeout(() => (headerCell.style.width = IndexColumn.DEFAULT_WIDTH_PX));
    return headerCell;
  }

  private static createDataCell(etc: EditableTableComponent, rowIndex: number) {
    const dataCell = IndexColumn.createCell(etc, false);
    const indexNumber = etc.auxiliaryTableContentInternal.indexColumnCountStartsAtHeader ? rowIndex + 1 : rowIndex;
    dataCell.innerText = String(indexNumber);
    return dataCell;
  }

  public static createAndPrependToRow(etc: EditableTableComponent, rowElement: HTMLElement, rowIndex: number) {
    const cell = rowIndex === 0 ? IndexColumn.createHeaderCell(etc) : IndexColumn.createDataCell(etc, rowIndex);
    if (etc.columnsDetails[0]) {
      ColumnSettingsBorderUtils.unsetSubjectBorder([cell], etc.columnsDetails[0].elements, 'right', 0); // REF-23
    }
    // events are added in updateRowCells method
    rowElement.appendChild(cell);
  }
}
