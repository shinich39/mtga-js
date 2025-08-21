import { MTGA } from "../mtga.js";
import { IModule } from "../types/module.js";
import { getRows } from "../types/row.js";
import { getState } from "../types/state.js";
import { parseKeyboardEvent } from "./utils.js";

const onKeydown = function (this: LineBreakModule, e: KeyboardEvent) {
  if (e.defaultPrevented) {
    return;
  }
  
  const mtga = this.parent;
  const el = this.parent.element;

  const { key, altKey, ctrlKey, shiftKey } = parseKeyboardEvent(e);
  const isValid = ctrlKey && !altKey && key === "Enter";
  if (!isValid) {
    return;
  }

  e.preventDefault();

  const { short, long, dir, isReversed } = getState(el);
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

  mtga.setState({
    isReversed: false,
    short: newShort,
    long: newLong,
    dir: "none",
    value: newValues.join(""),
  });

  mtga.addHistory();
}

export class LineBreakModule extends IModule {
  constructor(parent: MTGA) {
    super(parent, LineBreakModule.name);
  }

  onKeydown = onKeydown;

  static name = "LineBreak";

  static defaults = {};
}