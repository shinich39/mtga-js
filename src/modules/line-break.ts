import { MTGA } from "../mtga.js";
import { MTGAModule } from "../types/module.js";
import { IPairs } from "../types/pair.js";
import { getRows } from "../types/row.js";
import { getIndent, parseKeyboardEvent } from "./utils.js";

const onKeydown = function (this: LineBreakModule, e: KeyboardEvent) {
  if (e.defaultPrevented) {
    return;
  }
  
  const mtga = this.parent;
  const el = this.parent.element;
  const { pairs, indentUnit } = this;

  const { key, altKey, ctrlKey, shiftKey } = parseKeyboardEvent(e);
  const isValid = ctrlKey && !altKey && key === "Enter";
  if (!isValid) {
    return;
  }

  e.preventDefault();

  const { short, long, dir, isReversed } = mtga.getState();

  const rows = getRows(el);
  const selectedRows = rows.filter((r) => r.isSelected);
  const targetRow = e.shiftKey
    ? selectedRows[0]
    : selectedRows[selectedRows.length - 1];

  const isLastRowSelected = rows[rows.length - 1].index === selectedRows[selectedRows.length - 1].index;

  let newValues: string[] = [], 
      newShort = short, 
      newLong = long;

  for (const row of rows) {
    const isTarget = targetRow.index === row.index;
    if (!isTarget) {
      newValues.push(row.value);
      continue;
    }

    if (!shiftKey) {
      newValues.push(row.value + "\n");
      newShort = row.endIndex;
      newLong = row.endIndex;
    } else {
      newValues.push("\n" + row.value);
      newShort = row.startIndex;
      newLong = row.startIndex;
    }
  }

  // if last row selected, move caret to new line
  if (!shiftKey && isLastRowSelected) {
    newShort += 1;
    newLong += 1;
  }

  let newValue = newValues.join("");

  // calculate indent size
  const left = newValue.substring(0, newShort);
  const leftRows = left.split(/\r\n|\r|\n/);
  const currIndent = getIndent(pairs, indentUnit, leftRows);

  // add indent
  newValue = newValue.substring(0, newShort) + currIndent + newValue.substring(newLong);
  newShort += currIndent.length;
  newLong += currIndent.length;

  mtga.setState({
    isReversed: false,
    short: newShort,
    long: newLong,
    value: newValue,
  });
}

export class LineBreakModule extends MTGAModule {
  pairs: IPairs;
  indentUnit: string;

  constructor(parent: MTGA) {
    super(parent, LineBreakModule.name);
    this.pairs = LineBreakModule.defaults.pairs;
    this.indentUnit = LineBreakModule.defaults.indentUnit;
  }

  onKeydown = onKeydown;

  static name = "LineBreak";

  static defaults: {
    pairs: IPairs,
    indentUnit: string,
  } = {
    pairs: {
      "(": ")",
      "[": "]",
      "{": "}",
    },
    indentUnit: "  ",
  };
}