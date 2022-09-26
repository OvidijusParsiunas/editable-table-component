import {CellTypeTotals, ColumnDetailsT} from '../../types/columnDetails';
import {ACTIVE_COLUMN_TYPE, USER_SET_COLUMN_TYPE} from '../../enums/columnType';
import {CELL_TYPE} from '../../enums/cellType';

export class CellTypeTotalsUtils {
  public static readonly DEFAULT_COLUMN_TYPE = ACTIVE_COLUMN_TYPE.Text;

  public static createObj(): CellTypeTotals {
    return {
      [CELL_TYPE.Text]: 0,
      [CELL_TYPE.Number]: 0,
      [CELL_TYPE.Default]: 0,
    };
  }

  public static parseType(cellValue: string, defaultCellValue: string): CELL_TYPE {
    if (cellValue === defaultCellValue) {
      return CELL_TYPE.Default;
    }
    if (isNaN(cellValue as unknown as number)) {
      return CELL_TYPE.Text;
    }
    return CELL_TYPE.Number;
  }

  private static incrementType(type: CELL_TYPE, cellTypeTotals: CellTypeTotals) {
    cellTypeTotals[type] += 1;
  }

  private static decrementType(type: CELL_TYPE, cellTypeTotals: CellTypeTotals) {
    cellTypeTotals[type] -= 1;
  }

  // prettier-ignore
  private static changeTypeAndSetColumnType(
      columnDetails: ColumnDetailsT, changeFuncs: ((cellTypeTotals: CellTypeTotals) => void)[]) {
    const {cellTypeTotals, elements} = columnDetails;
    changeFuncs.forEach((func) => func(cellTypeTotals));
    if (columnDetails.userSetColumnType !== USER_SET_COLUMN_TYPE.Auto) {
      columnDetails.activeColumnType = CellTypeTotalsUtils.getActiveColumnType(cellTypeTotals, elements.length - 1);
    }
  }

  public static incrementCellTypeAndSetNewColumnType(columnDetails: ColumnDetailsT, defaultValue: string, text: string) {
    const type = CellTypeTotalsUtils.parseType(text, defaultValue);
    CellTypeTotalsUtils.changeTypeAndSetColumnType(columnDetails, [CellTypeTotalsUtils.incrementType.bind(this, type)]);
  }

  public static decrementCellTypeAndSetNewColumnType(columnDetails: ColumnDetailsT, defaultValue: string, text: string) {
    const type = CellTypeTotalsUtils.parseType(text, defaultValue);
    CellTypeTotalsUtils.changeTypeAndSetColumnType(columnDetails, [CellTypeTotalsUtils.decrementType.bind(this, type)]);
  }

  // prettier-ignore
  public static changeCellTypeAndSetNewColumnType(columnDetails: ColumnDetailsT, oldType: CELL_TYPE, newType: CELL_TYPE) {
    if (oldType === newType) return;
    CellTypeTotalsUtils.changeTypeAndSetColumnType(columnDetails,
      [CellTypeTotalsUtils.decrementType.bind(this, oldType), CellTypeTotalsUtils.incrementType.bind(this, newType)]);
  }

  public static getActiveColumnType(cellTypeTotals: CellTypeTotals, numberOfDataRows: number) {
    const cellTypes = Object.keys(cellTypeTotals) as unknown as CELL_TYPE[];
    // the logic does not take defaults into consideration as a column type, so if we have default as '-' and
    // the column contains the following data ['-','-',2,4], the column type is number
    const numberOfRowsWithDefaultText = cellTypeTotals[CELL_TYPE.Default];
    const numberOfRichRows = numberOfDataRows - numberOfRowsWithDefaultText;
    // if the column has nothing but defaults, the column type is set to whatever the default should be
    if (numberOfRichRows === 0) return CellTypeTotalsUtils.DEFAULT_COLUMN_TYPE;
    for (let i = 0; i < cellTypes.length; i += 1) {
      if (cellTypes[i] !== CELL_TYPE.Default) {
        if (cellTypeTotals[cellTypes[i]] === numberOfRichRows) {
          // enum values are numbers anyway
          return i as ACTIVE_COLUMN_TYPE;
        }
        // if there is a mixture (exc. default)
        if (cellTypeTotals[cellTypes[i]] !== 0) {
          return ACTIVE_COLUMN_TYPE.Text;
        }
      }
    }
    return CellTypeTotalsUtils.DEFAULT_COLUMN_TYPE;
  }
}

// in-case this is needed in the future:

// private static getBiggestColumnType(cellTypeTotals: CellTypeTotals) {
//   const keys = Object.keys(cellTypeTotals) as unknown as CELL_TYPE[];
//   const biggestColumnType = keys.reduce((p: CELL_TYPE, c: CELL_TYPE) => {
//     if (cellTypeTotals[c] > cellTypeTotals[p]) {
//       return c;
//     }
//     return p;
//   }, keys[0]);
//   return biggestColumnType;
// }