import {ElementSiblingIterator} from '../../../utils/elements/elementSiblingIterator';
import {InsertNewRow} from '../../../utils/insertRemoveStructure/insert/insertNewRow';
import {RemoveRow} from '../../../utils/insertRemoveStructure/remove/removeRow';
import {EditableTableComponent} from '../../../editable-table-component';
import {MoveRow} from '../../../utils/moveStructure/moveRow';
import {DropdownItem} from '../dropdownItem';
import {RowDropdown} from './rowDropdown';

export class RowDropdownItemEvents {
  // prettier-ignore
  private static onClickMiddleware(this: EditableTableComponent, func: Function): void {
    func();
    RowDropdown.hide(this);
  }

  // prettier-ignore
  public static set(etc: EditableTableComponent, dropdownElement: HTMLElement, rowIndex: number) {
    const firstItem = dropdownElement.getElementsByClassName(DropdownItem.DROPDOWN_ITEM_CLASS)[0] as HTMLElement;
    const siblingIterator = ElementSiblingIterator.create(firstItem);
    siblingIterator.currentElement().onclick = RowDropdownItemEvents.onClickMiddleware.bind(
      etc, InsertNewRow.insert.bind(this, etc, rowIndex, true));
    siblingIterator.next().onclick = RowDropdownItemEvents.onClickMiddleware.bind(
      etc, InsertNewRow.insert.bind(this, etc, rowIndex + 1, true));
    siblingIterator.next().onclick = RowDropdownItemEvents.onClickMiddleware.bind(
      etc, MoveRow.move.bind(this, etc, rowIndex, false));
    siblingIterator.next().onclick = RowDropdownItemEvents.onClickMiddleware.bind(
      etc, MoveRow.move.bind(this, etc, rowIndex, true));
    siblingIterator.next().onclick = RowDropdownItemEvents.onClickMiddleware.bind(
      etc, RemoveRow.remove.bind(this, etc, rowIndex));
    // TO-DO - potential animation can be useful when a row column is inserted
  }
}
