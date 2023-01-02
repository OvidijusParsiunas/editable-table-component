import {PaginationButtonContainerElement} from './buttonContainer/paginationButtonContainerElement';
import {NumberOfVisibleRowsElement} from './numberOfVisibleRows/numberOfVisibleRowsElement';
import {NumberOfRowsOptionsElement} from './numberOfRowsOptions/numberOfRowsOptionsElement';
import {EditableTableComponent} from '../../editable-table-component';

export class PaginationElements {
  public static readonly PAGINATION_TEXT_COMPONENT_CLASS = 'pagination-text-component';

  public static create(etc: EditableTableComponent) {
    etc.paginationInternal.buttonContainer = PaginationButtonContainerElement.create(etc);
    if (etc.paginationInternal.displayNumberOfRowsOptions) {
      etc.paginationInternal.numberOfRowsOptionsElement = NumberOfRowsOptionsElement.create(etc);
    }
    if (etc.paginationInternal.displayNumberOfVisibleRows) {
      etc.paginationInternal.numberOfVisibleRowsElement = NumberOfVisibleRowsElement.create(etc);
    }
  }
}
