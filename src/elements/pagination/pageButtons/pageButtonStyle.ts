import {IPageButtonsStyle} from '../../../types/paginationInternal';
import {PageButtonElement} from './pageButtonElement';
import {ElementStyle} from '../../../utils/elements/elementStyle';
import {PropertiesOfType} from '../../../types/utilityTypes';
import {StatefulCSSS} from '../../../types/cssStyle';

// action buttons will never be active
export class PageButtonStyle {
  // prettier-ignore
  private static unsetAllCSSStates(buttonElement: HTMLElement,
      pageButtonsStyle: IPageButtonsStyle, buttonType: keyof PropertiesOfType<IPageButtonsStyle, Required<StatefulCSSS>>) {
    ElementStyle.unsetAllCSSStates(buttonElement, pageButtonsStyle[buttonType]);
  }

  private static unsetAll(buttonElement: HTMLElement, pageButtonsStyle: IPageButtonsStyle, isActionButton: boolean) {
    if (buttonElement.classList.contains(PageButtonElement.ACTIVE_PAGINATION_BUTTON_CLASS)) {
      PageButtonStyle.unsetAllCSSStates(buttonElement, pageButtonsStyle, 'activeButton');
    } else if (buttonElement.classList.contains(PageButtonElement.DISABLED_PAGINATION_BUTTON_CLASS)) {
      ElementStyle.unsetStyle(buttonElement, pageButtonsStyle.disabledButtons);
    } else {
      PageButtonStyle.unsetAllCSSStates(buttonElement, pageButtonsStyle, isActionButton ? 'actionButtons' : 'buttons');
    }
  }

  public static setDefault(buttonElement: HTMLElement, pageButtonsStyle: IPageButtonsStyle, isActionButton: boolean) {
    PageButtonStyle.unsetAll(buttonElement, pageButtonsStyle, isActionButton);
    if (isActionButton) {
      Object.assign(buttonElement.style, pageButtonsStyle.actionButtons.default);
    } else {
      Object.assign(buttonElement.style, pageButtonsStyle.buttons.default);
    }
  }

  // prettier-ignore
  public static setActive(newActiveButton: HTMLElement, pageButtonsStyle: IPageButtonsStyle,
      previousActiveButton?: HTMLElement) {
    if (previousActiveButton) {
      PageButtonStyle.unsetAllCSSStates(previousActiveButton, pageButtonsStyle, 'activeButton');
      Object.assign(previousActiveButton.style, pageButtonsStyle.buttons.default);
    }
    if (newActiveButton.classList.contains(PageButtonElement.DISABLED_PAGINATION_BUTTON_CLASS)) {
      ElementStyle.unsetStyle(newActiveButton, pageButtonsStyle.disabledButtons);
    } else {
      PageButtonStyle.unsetAllCSSStates(newActiveButton, pageButtonsStyle, 'buttons');
    }
    Object.assign(newActiveButton.style, pageButtonsStyle.activeButton.default);
  }

  public static setDisabled(buttonElement: HTMLElement, pageButtonsStyle: IPageButtonsStyle, isActionButton: boolean) {
    PageButtonStyle.setDefault(buttonElement, pageButtonsStyle, isActionButton);
    Object.assign(buttonElement.style, pageButtonsStyle.disabledButtons);
  }

  public static mouseDown(buttonElement: HTMLElement, pageButtonsStyle: IPageButtonsStyle, isActionButton: boolean) {
    if (buttonElement.classList.contains(PageButtonElement.ACTIVE_PAGINATION_BUTTON_CLASS)) {
      Object.assign(buttonElement.style, pageButtonsStyle.activeButton.click);
    } else if (isActionButton) {
      Object.assign(buttonElement.style, pageButtonsStyle.actionButtons.click);
    } else {
      Object.assign(buttonElement.style, pageButtonsStyle.buttons.click);
    }
  }

  public static mouseEnter(buttonElement: HTMLElement, pageButtonsStyle: IPageButtonsStyle, isActionButton: boolean) {
    if (buttonElement.classList.contains(PageButtonElement.DISABLED_PAGINATION_BUTTON_CLASS)) return;
    if (buttonElement.classList.contains(PageButtonElement.ACTIVE_PAGINATION_BUTTON_CLASS)) {
      // needed to unset click style and reset default + hover styles
      PageButtonStyle.unsetAllCSSStates(buttonElement, pageButtonsStyle, 'activeButton');
      Object.assign(buttonElement.style, pageButtonsStyle.activeButton.default);
      Object.assign(buttonElement.style, pageButtonsStyle.activeButton.hover);
    } else {
      // needed to unset click style and reset default + hover styles
      PageButtonStyle.setDefault(buttonElement, pageButtonsStyle, isActionButton);
      if (isActionButton) {
        Object.assign(buttonElement.style, pageButtonsStyle.actionButtons.hover);
      } else {
        Object.assign(buttonElement.style, pageButtonsStyle.buttons.hover);
      }
    }
  }

  public static mouseLeave(buttonElement: HTMLElement, pageButtonsStyle: IPageButtonsStyle, isActionButton: boolean) {
    // this is required because mouseLeave can be fired when the hovered button is disabled
    // as pointer-events are set to none
    if (buttonElement.classList.contains(PageButtonElement.DISABLED_PAGINATION_BUTTON_CLASS)) return;
    if (buttonElement.classList.contains(PageButtonElement.ACTIVE_PAGINATION_BUTTON_CLASS)) {
      PageButtonStyle.unsetAll(buttonElement, pageButtonsStyle, false);
      Object.assign(buttonElement.style, pageButtonsStyle.activeButton.default);
    } else {
      PageButtonStyle.setDefault(buttonElement, pageButtonsStyle, isActionButton);
    }
  }
}
