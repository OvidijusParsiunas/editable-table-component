import {CellStateColorProperties} from '../../types/cellStateColors';

export class CellHighlightUtils {
  public static DEFAULT_HOVER_PROPERTIES: Required<CellStateColorProperties> = {
    backgroundColor: '#f7f7f7',
    color: '',
  };

  public static unsetDefaultHoverProperties() {
    CellHighlightUtils.DEFAULT_HOVER_PROPERTIES.backgroundColor = '';
    CellHighlightUtils.DEFAULT_HOVER_PROPERTIES.color = '';
  }

  public static fade(cellElement: HTMLElement, defaultColorProperties?: CellStateColorProperties) {
    cellElement.style.backgroundColor = defaultColorProperties?.backgroundColor || '';
    cellElement.style.color = defaultColorProperties?.color || '';
  }

  public static highlight(cellElement: HTMLElement, hoverColorProperties?: CellStateColorProperties) {
    if (hoverColorProperties?.backgroundColor) cellElement.style.backgroundColor = hoverColorProperties.backgroundColor;
    if (hoverColorProperties?.color) cellElement.style.color = hoverColorProperties.color;
  }
}
