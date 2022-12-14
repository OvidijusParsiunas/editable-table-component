import {AuxiliaryTableContentInternalUtils} from './utils/auxiliaryTableContent/auxiliaryTableContentInternalUtils';
import {ActiveOverlayElementsUtils} from './utils/activeOverlayElements/activeOverlayElementsUtils';
import {RowDropdownSettingsUtil} from './elements/dropdown/rowDropdown/rowDropdownSettingsUtil';
import {DropdownDisplaySettingsUtil} from './elements/dropdown/dropdownDisplaySettingsUtil';
import {InitialContentsProcessing} from './utils/contents/initialContentsProcessing';
import {UserKeyEventsStateUtils} from './utils/userEventsState/userEventsStateUtils';
import {AuxiliaryTableContentInternal} from './types/auxiliaryTableContentInternal';
import {DynamicCellTextUpdate} from './utils/dynamicUpdates/dynamicCellTextUpdate';
import {PaginationInternalUtils} from './utils/pagination/paginationInternalUtils';
import {FocusedElementsUtils} from './utils/focusedElements/focusedElementsUtils';
import {TableDimensionsUtils} from './utils/tableDimensions/tableDimensionsUtils';
import {ColumnSettingsUtils} from './utils/columnSettings/columnSettingsUtils';
import {PaginationElements} from './elements/pagination/paginationElements';
import {LITElementTypeConverters} from './utils/LITElementTypeConverters';
import {DefaultColumnTypes} from './utils/columnType/defaultColumnTypes';
import {StickyProcessUtils} from './utils/stickyProps/stickyPropsUtils';
import {TableDimensionsInternal} from './types/tableDimensionsInternal';
import {RowDropdownCellOverlays} from './types/rowDropdownCellOverlays';
import {DropdownDisplaySettings} from './types/dropdownDisplaySettings';
import {AuxiliaryTableContent} from './types/auxiliaryTableContent';
import {ActiveOverlayElements} from './types/activeOverlayElements';
import {StripedRows as StripedRowsType} from './types/stripedRows';
import {customElement, property, state} from 'lit/decorators.js';
import {RowDropdownSettings} from './types/rowDropdownSettings';
import {StripedRowsInternal} from './types/stripedRowsInternal';
import {ediTableStyle} from './editable-table-component-style';
import {WindowElement} from './elements/window/windowElement';
import {UserKeyEventsState} from './types/userKeyEventsState';
import {CellText, TableContents} from './types/tableContents';
import {PaginationInternal} from './types/paginationInternal';
import {OverflowUtils} from './utils/overflow/overflowUtils';
import {UserSetColumnSizerStyle} from './types/columnSizer';
import {RowHoverEvents} from './utils/rows/rowHoverEvents';
import {TableElement} from './elements/table/tableElement';
import {CELL_UPDATE_TYPE} from './enums/onUpdateCellType';
import {OverflowInternal} from './types/overflowInternal';
import {ParentResize} from './utils/render/parentResize';
import {TableDimensions} from './types/tableDimensions';
import {FocusedElements} from './types/focusedElements';
import {HoveredElements} from './types/hoveredElements';
import {ColumnsDetailsT} from './types/columnDetails';
import {StripedRows} from './utils/rows/stripedRows';
import {StickyProps} from './types/stickyProps';
import {Browser} from './utils/browser/browser';
import {Pagination} from './types/pagination';
import {Render} from './utils/render/render';
import {Overflow} from './types/overflow';
import {RowHover} from './types/rowHover';
import {CSSStyle} from './types/cssStyle';
import {LitElement} from 'lit';
import {
  DefaultColumnsSettings,
  CustomColumnsSettings,
  CustomColumnSettings,
  ColumnsSettingsMap,
} from './types/columnsSettings';

// TO-DO
// rename file name from using hyphen case to camel

@customElement('editable-table-component')
export class EditableTableComponent extends LitElement {
  static override styles = [ediTableStyle];

  public static ELEMENT_TAG = 'EDITABLE-TABLE-COMPONENT';

  @property({type: Array})
  contents: TableContents = [
    ['R', 'G', 'B', 'Color'],
    [255, 0, 0, 'Red'],
    [254, 0, 0, 'Red'],
    [0, 255, 0, 'Green'],
    [0, 254, 0, 'Green'],
  ];

  // REF-20
  // check if types for this work
  @property({converter: LITElementTypeConverters.convertToFunction})
  onCellUpdate: (newText: CellText, cellRowIndex: number, cellColumnIndex: number, updateType: CELL_UPDATE_TYPE) => void =
    () => {};

  @property({converter: LITElementTypeConverters.convertToFunction})
  onTableUpdate: (newTableContents: TableContents) => void = () => {};

  @property({
    type: Boolean,
    converter: LITElementTypeConverters.convertToBoolean,
  })
  duplicateHeadersAllowed = true;

  @property({
    type: Boolean,
    converter: LITElementTypeConverters.convertToBoolean,
  })
  areIconsDisplayedInHeaders = true;

  @property({
    type: Boolean,
    converter: LITElementTypeConverters.convertToBoolean,
  })
  spellCheck = false;

  // WORK - header row events do not work in Firefox when row in not initial position
  @property({
    type: Boolean,
    converter: LITElementTypeConverters.convertToBoolean,
  })
  isHeaderSticky: boolean | undefined;

  // setting header to true if above is undefined and vertical overflow is present
  // (using object to be able to set values without re-rendering the component)
  @state()
  stickyProps: StickyProps = {header: false};

  // set as boolean to not update on initial render
  @property({
    type: Object,
  })
  updateCellText = true;

  @property({type: Object})
  defaultColumnsSettings: DefaultColumnsSettings = {};

  @property({type: Array<CustomColumnSettings>})
  customColumnsSettings: CustomColumnsSettings = [];

  @state()
  customColumnsSettingsInternal: ColumnsSettingsMap = {};

  // this contains all cell elements, if there is a need to access cell elements outside the context of columns
  // create an entirely new state object and access elements from there as we don't want to store all elements
  // multiple times, and use this instead for data exclusively on columns, such as width etc.
  @state()
  columnsDetails: ColumnsDetailsT = [];

  @state()
  tableElementRef: HTMLElement | null = null;

  @state()
  tableBodyElementRef: HTMLElement | null = null;

  @state()
  addRowCellElementRef: HTMLElement | null = null;

  // the reason why keeping ref of all the add column cells and not column index cells is because this can be toggled
  @state()
  addColumnCellsElementsRef: HTMLElement[] = [];

  @state()
  columnGroupRef: HTMLElement | null = null;

  @state()
  focusedElements: FocusedElements = FocusedElementsUtils.createEmpty();

  @state()
  hoveredElements: HoveredElements = {};

  @state()
  activeOverlayElements: ActiveOverlayElements = ActiveOverlayElementsUtils.createNew();

  @state()
  userKeyEventsState: UserKeyEventsState = UserKeyEventsStateUtils.createNew();

  // TO-DO height - keep in mind that by resizing columns - the height can change
  @property({type: Object})
  tableDimensions: TableDimensions = {};

  @state()
  tableDimensionsInternal: TableDimensionsInternal = TableDimensionsUtils.getDefault();

  @state()
  selectDropdownContainer: HTMLElement | null = null;

  @property({type: Object})
  tableStyle: CSSStyle = {};

  @property({type: Object})
  rowHover: RowHover | null = null;

  // REF-22 - to be used by the client
  // auxiliary content is comprised of index column, add new column column and add new row row
  // Not using AuxiliaryTableContentColors.CELL_COLORS for default value as the '' values will stop logical OR operators
  @property({type: Object})
  auxiliaryTableContent: AuxiliaryTableContent = {};

  // REF-22 - to be used internally
  @state()
  auxiliaryTableContentInternal: AuxiliaryTableContentInternal = AuxiliaryTableContentInternalUtils.getDefault();

  // called columnResizer for the client - columnSizer in the code
  @property({type: Object})
  columnResizerStyle: UserSetColumnSizerStyle = {};

  // these properties are toggled for all columns for consistent UX
  @property({type: Object})
  columnDropdownDisplaySettings: DropdownDisplaySettings = {isAvailable: true, openMethod: {overlayClick: true}};

  // WORK - cell click should be the default one when nothing is set by the user and index is available
  @property({type: Object})
  rowDropdownSettings: RowDropdownSettings = {displaySettings: {isAvailable: true, openMethod: {overlayClick: true}}};

  // column dropdown overlays are stored inside ColumnDetailsT columnDropdownCellOverlay
  @state()
  rowDropdownCellOverlays: RowDropdownCellOverlays = [];

  // if using pagination with user defined numberOfRowsOptions, the options need to have an even number or otherwise
  // two rows could have same color (as rows are hidden and not removed)
  @property({type: Object})
  stripedRows: StripedRowsType | boolean | null = null;

  @state()
  stripedRowsInternal: StripedRowsInternal | null = null;

  @property({type: Object})
  overflow: Overflow | null = null;

  @state()
  overflowInternal: OverflowInternal | null = null;

  @property({type: Object})
  pagination: Pagination | null = null;

  @state()
  paginationInternal: PaginationInternal = PaginationInternalUtils.getDefault();

  // CAUTION-4
  override render() {
    Render.renderTable(this);
    this.onTableUpdate(this.contents);
    new ResizeObserver(ParentResize.resizeCallback.bind(this)).observe(this.parentElement as HTMLElement);
  }

  private onConnect() {
    // REF-14
    super.connectedCallback();
    StickyProcessUtils.process(this);
    AuxiliaryTableContentInternalUtils.set(this.auxiliaryTableContent, this.auxiliaryTableContentInternal);
    RowDropdownSettingsUtil.process(this.rowDropdownSettings, this.auxiliaryTableContentInternal.displayIndexColumn);
    DropdownDisplaySettingsUtil.process(this.columnDropdownDisplaySettings);
    if (this.pagination) PaginationInternalUtils.process(this);
    if (this.stripedRows) StripedRows.process(this);
    if (this.rowHover) RowHoverEvents.process(this.rowHover);
    const tableElement = TableElement.createInfrastructureElements(this);
    if (this.overflow) OverflowUtils.setupContainer(this, tableElement); // must not be after BORDER_DIMENSIONS is set
    TableElement.addOverlayElements(this, tableElement, this.activeOverlayElements);
    this.shadowRoot?.appendChild(this.overflowInternal?.overflowContainer || tableElement);
    if (this.pagination) PaginationElements.create(this);
    InitialContentsProcessing.preProcess(this.contents);
    WindowElement.setEvents(this);
    ColumnSettingsUtils.setUpInternalSettings(this);
    DefaultColumnTypes.createDropdownItemsForDefaultTypes();
    this.spellcheck = this.spellCheck;
  }

  override connectedCallback() {
    // REF-14
    if (Browser.IS_FIREFOX) {
      setTimeout(() => this.onConnect());
    } else {
      this.onConnect();
    }
  }

  // using shouldUpdate instead of .hasChanged lifecycle property on the updateCellText property because it cannot access
  // 'this' variable - which we need to udpate the cell
  override shouldUpdate(dynamicUpdate: Map<string, unknown>): boolean {
    if (dynamicUpdate.has('updateCellText') && typeof this.updateCellText === 'object') {
      DynamicCellTextUpdate.update(this, this.updateCellText);
      return false; // does not cause a re-render
    }
    return true;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'editable-table-component': EditableTableComponent;
  }
}

// if using raw javascript, this is a direction to help move away from using render
// the initial values should be fetched in connectedCallBack (or set to default) and their changes can be observed in
// MutationObserver, this would also save callback and boolean changes from having to re-render the screen

// @state()
// observer = new MutationObserver(function (mutations) {
//   mutations.forEach(function (mutation) {
//     if (mutation.attributeName === 'contents') {
//       console.log(mutation);
//       console.log('attributes changed');
//     }
//   });
// });

// override connectedCallback() {
//   super.connectedCallback();
//   this.observer.observe(this, {
//     attributes: true, //configure it to listen to attribute changes
//   });
