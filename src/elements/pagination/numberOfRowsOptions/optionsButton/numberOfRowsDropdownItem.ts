import {NumberOfRowsDropdownItemEvents} from './numberOfRowsDropdownItemEvents';
import {EditableTableComponent} from '../../../../editable-table-component';
import {DropdownItem} from '../../../dropdown/dropdownItem';

export class NumberOfRowsDropdownItem {
  private static readonly ITEM_CLASS = 'number-of-rows-dropdown-item';
  public static readonly ALL_ITEM_TEXT = 'all'; // lower case as it will be compared against user set text

  public static unsetHoverColors(items: HTMLElement[]) {
    // active item uses a class so unsetting this prop doesn't affect it
    items.forEach((item) => (item.style.backgroundColor = ''));
  }

  public static unsetActiveItem(dropdownElement: HTMLElement) {
    const activeItem = dropdownElement.getElementsByClassName(DropdownItem.ACTIVE_ITEM_CLASS)[0] as HTMLElement;
    activeItem?.classList.remove(DropdownItem.ACTIVE_ITEM_CLASS);
  }

  public static setActive(items: HTMLElement[], targetItemText: string) {
    const activeItem = items.find((item) => item.innerText === targetItemText);
    activeItem?.classList.add(DropdownItem.ACTIVE_ITEM_CLASS);
  }

  public static populate(etc: EditableTableComponent, dropdownElement: HTMLElement, optionsButton: HTMLElement) {
    etc.paginationInternal.numberOfRowsOptionsItemText.forEach((itemText) => {
      const itemsSettings = {text: String(itemText)};
      const item = DropdownItem.addButtonItem(etc, dropdownElement, itemsSettings, NumberOfRowsDropdownItem.ITEM_CLASS);
      NumberOfRowsDropdownItemEvents.setEvents(etc, item, optionsButton);
    });
    const activeItemText = String(etc.paginationInternal.numberOfRows);
    NumberOfRowsDropdownItem.setActive(Array.from(dropdownElement.children) as HTMLElement[], activeItemText);
  }
}
