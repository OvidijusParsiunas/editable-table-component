import {AuxiliaryTableContentColors} from '../../../../utils/auxiliaryTableContent/auxiliaryTableContentColors';
import {InsertNewRow} from '../../../../utils/insertRemoveStructure/insert/insertNewRow';
import {EditableTableComponent} from '../../../../editable-table-component';
import {CellHighlightUtil} from '../../../../utils/color/cellHighlightUtil';

export class AddNewRowEvents {
  private static mouseEnterCell(this: EditableTableComponent, event: MouseEvent) {
    CellHighlightUtil.highlight(event.target as HTMLElement, AuxiliaryTableContentColors.CELL_COLORS.data.hover);
  }

  private static mouseLeaveCell(this: EditableTableComponent, event: MouseEvent) {
    CellHighlightUtil.fade(event.target as HTMLElement, AuxiliaryTableContentColors.CELL_COLORS.data.default);
  }

  public static setEvents(etc: EditableTableComponent, addNewRowCellElement: HTMLElement) {
    addNewRowCellElement.onclick = InsertNewRow.insertEvent.bind(etc);
    addNewRowCellElement.onmouseenter = AddNewRowEvents.mouseEnterCell.bind(etc);
    addNewRowCellElement.onmouseleave = AddNewRowEvents.mouseLeaveCell.bind(etc);
  }
}
