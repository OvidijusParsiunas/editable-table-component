import {ColumnSettingsUtils} from '../columnSettings/columnSettingsUtils';
import {EditableTableComponent} from '../../editable-table-component';
import {FocusedCellUtils} from '../focusedElements/focusedCellUtils';
import {ColumnTypeInternal} from '../../types/columnTypeInternal';
import {ChangeColumnType} from '../columnType/changeColumnType';
import {CellElement} from '../../elements/cell/cellElement';
import {ColumnDetailsT} from '../../types/columnDetails';
import {MoveUtils} from './moveUtils';

export class MoveColumn {
  // prettier-ignore
  private static overwriteDataElements(etc: EditableTableComponent, targetElements: HTMLElement[],
      targetColIndex: number, sourceCellText: string[]) {
    const overwrittenText: string[] = [];
    targetElements.slice(1).forEach((element, rowIndex) => {
      const relativeIndex = rowIndex + 1;
      const sourceText = sourceCellText[relativeIndex];
      const oldText = MoveUtils.setNewElementText(etc, sourceText, element, targetColIndex, relativeIndex);
      overwrittenText.push(oldText);
    });
    return overwrittenText;
  }

  // prettier-ignore
  private static changeSettings(etc: EditableTableComponent, targetColIndex: number, targetHeader: HTMLElement,
      targetColumnDetails: ColumnDetailsT, sourceType: ColumnTypeInternal) {
    ColumnSettingsUtils.changeColumnSettingsIfNameDifferent(etc, targetHeader, targetColIndex);
    if (sourceType !== targetColumnDetails.activeType) {
      ChangeColumnType.change.bind(etc)(sourceType.name, targetColIndex);
    }
  }

  // prettier-ignore
  private static overwrite(etc: EditableTableComponent, targetColumnDetails: ColumnDetailsT,
      targetColIndex: number, sourceCellText: string[], sourceType: ColumnTypeInternal) {
    const overwrittenText: string[] = [];
    const {elements: targetElements, activeType: targetType} = targetColumnDetails;
    const oldHeaderText = MoveUtils.setNewElementText(etc, sourceCellText[0], targetElements[0], targetColIndex, 0);
    overwrittenText.push(oldHeaderText);
    MoveColumn.changeSettings(etc, targetColIndex, targetElements[0], targetColumnDetails, sourceType);
    const overwrittenDataText = MoveColumn.overwriteDataElements(etc, targetElements, targetColIndex, sourceCellText);
    overwrittenText.push(...overwrittenDataText);
    return { overwrittenText, overwrittenType: targetType };
  }

  private static firstChangeSettingsIfSettingsChanged(etc: EditableTableComponent, columnIndex: number) {
    const {areSettingsDifferent} = ColumnSettingsUtils.parseSettingsChange(etc);
    if (areSettingsDifferent) {
      const currentColumn = etc.columnsDetails[columnIndex];
      ColumnSettingsUtils.changeColumnSettingsIfNameDifferent(etc, currentColumn.elements[0], columnIndex);
    }
  }

  public static move(etc: EditableTableComponent, columnIndex: number, isToRight: boolean) {
    MoveColumn.firstChangeSettingsIfSettingsChanged(etc, columnIndex);
    const currentColumn = etc.columnsDetails[columnIndex];
    const siblingIndex = isToRight ? columnIndex + 1 : columnIndex - 1;
    const siblingColumn = etc.columnsDetails[siblingIndex];
    const siblingColumnText = etc.columnsDetails[siblingIndex].elements.map((element) => CellElement.getText(element));
    // overwrite current column using sibling column
    const overwritten = MoveColumn.overwrite(etc, currentColumn, columnIndex, siblingColumnText, siblingColumn.activeType);
    FocusedCellUtils.set(etc.focusedElements.cell, siblingColumn.elements[0], 0, siblingIndex, siblingColumn.types);
    // overwrite sibling column using overwritten content
    MoveColumn.overwrite(etc, siblingColumn, siblingIndex, overwritten.overwrittenText, overwritten.overwrittenType);
  }
}
