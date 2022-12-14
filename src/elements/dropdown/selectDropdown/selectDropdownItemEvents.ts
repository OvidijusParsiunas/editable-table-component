import {DropdownItemHighlightUtils} from '../../../utils/color/dropdownItemHighlightUtils';
import {SelectDropdownHorizontalScrollFix} from './selectDropdownHorizontalScrollFix';
import {ActiveSelectItems, SelectDropdownT} from '../../../types/columnDetails';
import {ElementVisibility} from '../../../utils/elements/elementVisibility';
import {SelectDeleteButton} from './selectDeleteButton';
import {SIDE} from '../../../types/side';

export class SelectDropdownItemEvents {
  // prettier-ignore
  public static blurItem(dropdown: SelectDropdownT, typeOfItem: keyof ActiveSelectItems, event?: MouseEvent) {
    const {activeItems, scrollbarPresence, oneActiveColor} = dropdown;
    const itemElement = activeItems[typeOfItem] as HTMLElement;
    if (itemElement !== undefined) {
      if (typeOfItem === 'matchingWithCellText'
          || (typeOfItem === 'hovered' && itemElement !== activeItems.matchingWithCellText)) {
        itemElement.style.backgroundColor = '';
        if (oneActiveColor) itemElement.style.color = '';
        delete activeItems[typeOfItem];
      }
    }
    if (event && dropdown.canAddMoreOptions) SelectDeleteButton.changeVisibility(event, scrollbarPresence.vertical);
  }

  // prettier-ignore
  private static scrollToItem(shadow: Document, itemElement: HTMLElement,
      isHorizontalScrollPresent: boolean, dropdownElement: HTMLElement, event: MouseEvent) {
    // not automatically scrolling when user hovers their mouse over a partial item as it is bad UX
    if (event.isTrusted) return; 
    const visibilityDetails = ElementVisibility.isVerticallyVisibleInsideParent(itemElement, shadow);
    if (!visibilityDetails.isFullyVisible) {
      itemElement.scrollIntoView({block: 'nearest'});
      // REF-4
      if (isHorizontalScrollPresent && visibilityDetails.blockingSides.has(SIDE.BOTTOM)) {
        SelectDropdownHorizontalScrollFix.scrollDownFurther(dropdownElement)
      }
    }
  }

  private static highlightItem(this: Document, color: string, dropdown: SelectDropdownT, event: MouseEvent) {
    const {scrollbarPresence, activeItems, oneActiveColor, canAddMoreOptions, element} = dropdown;
    // this is used for a case where an item is highlighted via arrow and then mouse hovers over another item
    if (activeItems.hovered) {
      activeItems.hovered.style.backgroundColor = '';
      if (oneActiveColor) activeItems.hovered.style.color = '';
    }
    const itemElement = event.target as HTMLElement;
    itemElement.style.backgroundColor = color;
    const dropdownElement = itemElement.parentElement as HTMLElement;
    SelectDropdownItemEvents.scrollToItem(this, itemElement, scrollbarPresence.horizontal, dropdownElement, event);
    if (itemElement === activeItems.matchingWithCellText) {
      if (oneActiveColor) itemElement.style.color = 'white';
      delete activeItems.hovered;
    } else {
      if (oneActiveColor) itemElement.style.backgroundColor = DropdownItemHighlightUtils.HOVER_BACKGROUND_COLOR;
      activeItems.hovered = itemElement;
    }
    if (canAddMoreOptions) SelectDeleteButton.changeVisibility(event, scrollbarPresence.vertical, element);
  }

  public static set(shadow: Document, itemElement: HTMLElement, color: string, dropdown: SelectDropdownT) {
    itemElement.onmouseenter = SelectDropdownItemEvents.highlightItem.bind(shadow, color, dropdown);
    itemElement.onmouseleave = SelectDropdownItemEvents.blurItem.bind(this, dropdown, 'hovered');
  }
}
