import {DateCellCalendarIconElement} from './cellsWithTextDiv/dateCell/dateCellCalendarIconElement';
import {ColumnSettingsBorderUtils} from '../../utils/columnSettings/columnSettingsStyleBorderUtils';
import {ColumnSettingsWidthUtil} from '../../utils/columnSettings/columnSettingsWidthUtil';
import {ColumnSettingsStyleUtil} from '../../utils/columnSettings/columnSettingsStyleUtil';
import {FirefoxCaretDisplayFix} from '../../utils/browser/firefox/firefoxCaretDisplayFix';
import {DateCellInputElement} from './cellsWithTextDiv/dateCell/dateCellInputElement';
import {CellTextElement} from './cellsWithTextDiv/text/cellTextElement';
import {ColumnDetails} from '../../utils/columnDetails/columnDetails';
import {EditableTableComponent} from '../../editable-table-component';
import {ColumnSettingsInternal} from '../../types/columnsSettings';
import {HeaderCellEvents} from './headerCell/headerCellEvents';
import {DataCellEvents} from './dataCell/dataCellEvents';
import {Browser} from '../../utils/browser/browser';
import {CSSStyle} from '../../types/cssStyle';

export class CellElement {
  public static readonly CELL_CLASS = 'cell';

  // prettier-ignore
  // this is used for case where element could be the cell element or the text inside a category cell
  public static extractCellElement(element: HTMLElement) {
    // if category cell text or date cell text/input container
    if (element.classList.contains(CellTextElement.CELL_TEXT_DIV_CLASS) ||
        element.classList.contains(DateCellInputElement.DATE_INPUT_CONTAINER_CLASS)) {
      return element.parentElement as HTMLElement;
      // if date cell input
    } else if (element.classList.contains(DateCellInputElement.DATE_INPUT_CLASS) ||
        element.classList.contains(DateCellCalendarIconElement.CALENDAR_ICON_CONTAINER_CLASS)) {
      return (element.parentElement as HTMLElement).parentElement as HTMLElement;
    }
    // if cell
    return element;
  }

  // prettier-ignore
  public static setCellEvents(etc: EditableTableComponent,
      cellElement: HTMLElement, rowIndex: number, columnIndex: number) {
    if (rowIndex === 0) {
      HeaderCellEvents.setEvents(etc, cellElement, columnIndex);
    } else {
      DataCellEvents.setEvents(etc, cellElement, rowIndex, columnIndex);
    }
  }

  public static setDefaultCellStyle(cellElement: HTMLElement, cellStyle: CSSStyle, customStyle?: CSSStyle) {
    Object.assign(cellElement.style, cellStyle, customStyle);
  }

  public static create(cellStyle: CSSStyle, isHeader: boolean, customStyle?: CSSStyle) {
    const cellElement = document.createElement(isHeader ? 'th' : 'td');
    cellElement.classList.add(CellElement.CELL_CLASS);
    // role for assistive technologies
    cellElement.setAttribute('role', 'textbox');
    // should probably remove border width from headerStyle if cellStyle contains it as it will affect the sizer position
    // but the table looks off when the header and data cells have different border styles so it is not expected that
    // users will desire headerstyle it, hence not implementending headerStyle preprocessing functionality
    CellElement.setDefaultCellStyle(cellElement, cellStyle, customStyle);
    return cellElement;
  }

  public static prepContentEditable(cellElement: HTMLElement, isHeader: boolean) {
    if (Browser.IS_FIREFOX) {
      FirefoxCaretDisplayFix.setTabIndex(cellElement, isHeader);
      FirefoxCaretDisplayFix.removeContentEditable(cellElement);
    } else {
      cellElement.contentEditable = String(!isHeader);
    }
  }

  // this is used for case where element could be cell element that contains a text div element,
  // hence we need to set the text into the correct container
  private static setText(element: HTMLElement, text: string) {
    // if category or date cell
    if (element.children[0]?.classList.contains(CellTextElement.CELL_TEXT_DIV_CLASS)) {
      element.children[0].textContent = text;
    } else {
      element.textContent = text;
    }
  }

  // set text is optional as some functions may only need to augment the cell
  // prettier-ignore
  public static processAndSetTextOnCell(etc: EditableTableComponent, textContainerElement: HTMLElement, text: string,
      isUndo: boolean, setText = true) {
    if (setText) CellElement.setText(textContainerElement, text);
    // called in all browsers for consistency
    FirefoxCaretDisplayFix.toggleCellTextBRPadding(etc, textContainerElement, isUndo);
  }

  private static setColumnWidth(tableElement: HTMLElement, cellElement: HTMLElement, settings?: ColumnSettingsInternal) {
    if (settings && ColumnSettingsWidthUtil.isWidthDefined(settings)) {
      ColumnSettingsWidthUtil.updateColumnAndAuxWidth(tableElement, cellElement, settings, true);
    } else {
      cellElement.style.width = `${ColumnDetails.NEW_COLUMN_WIDTH}px`;
    }
  }

  private static createCellDOMElement(etc: EditableTableComponent, cellText: string, colIndex: number, isHeader: boolean) {
    const {cellStyle, header, columnsDetails, tableElementRef} = etc;
    const columnDetails = columnsDetails[colIndex];
    const cellElement = CellElement.create(cellStyle, isHeader, isHeader ? header.defaultStyle || {} : {});
    const {settings} = columnDetails;
    if (settings) ColumnSettingsStyleUtil.setSettingsStyleOnCell(settings, cellElement, isHeader);
    ColumnSettingsBorderUtils.overwriteSideBorderIfSiblingsHaveSettings(columnDetails, cellElement);
    CellElement.processAndSetTextOnCell(etc, cellElement, cellText, false);
    CellElement.prepContentEditable(cellElement, isHeader);
    // overwritten again if static table
    if (isHeader) CellElement.setColumnWidth(tableElementRef as HTMLElement, cellElement, settings);
    return cellElement;
  }

  public static createCellElement(etc: EditableTableComponent, cellText: string, rowIndex: number, columnIndex: number) {
    const cellElement = CellElement.createCellDOMElement(etc, cellText, columnIndex, rowIndex === 0);
    CellElement.setCellEvents(etc, cellElement, rowIndex, columnIndex);
    return cellElement;
  }
}
