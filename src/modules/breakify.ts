import { MTGA } from "../mtga.js";
import { setState, getRows, parseKeyboardEvent, getState } from "./utils.js";

declare module "../mtga.js" {
  interface MTGA {
    breakify: Breakify;
  }
}

const onKeydown = function (this: MTGA, e: KeyboardEvent) {
  if (e.defaultPrevented) {
    return;
  }
  
  const { key, altKey, ctrlKey, shiftKey } = parseKeyboardEvent(e);
  const isValid = ctrlKey && !altKey && key === "Enter";
  if (!isValid) {
    return;
  }

  e.preventDefault();

  const el = this.element;
  const { short, long, dir, isReversed } = getState(el);
  const rows = getRows(el);
  const selectedRows = rows.filter((r) => r.isSelected);
  const targetRow = e.shiftKey
    ? selectedRows[0]
    : selectedRows[selectedRows.length - 1];

  let newValues: string[] = [], 
      newShort = short, 
      newLong = long;

  for (const row of rows) {
    const isTarget = targetRow.index === row.index;
    if (!isTarget) {
      newValues.push(row.value);
      continue;
    }

    if (!e.shiftKey) {
      newValues.push(row.value + "\n");
      newShort = row.endIndex;
      newLong = row.endIndex;
    } else {
      newValues.push("\n" + row.value);
      newShort = row.startIndex;
      newLong = row.startIndex;
    }
  }

  setState(el, {
    isReversed: false,
    short: newShort,
    long: newLong,
    dir: "none",
    value: newValues.join(""),
  });

  this.history.add();
}

export class Breakify {
  parent: MTGA;

  constructor(parent: MTGA) {
    this.parent = parent;

    parent.modules.push(
      {
        name: "breakify",
        onKeydown: onKeydown,
      }
    );
  }

  static defaults = {}
}