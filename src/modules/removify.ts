import { MTGA } from "../mtga.js";
import { setState, getRows, parseKeyboardEvent, getState } from "./utils.js";

declare module "../mtga.js" {
  interface MTGA {
    removify: Removify;
  }
}

const onKeydown = function (this: MTGA, e: KeyboardEvent) {
  if (e.defaultPrevented) {
    return;
  }

  const { key, altKey, ctrlKey, shiftKey } = parseKeyboardEvent(e);
  const isValid = ctrlKey && !altKey && shiftKey && key.toLowerCase() === "k";
  if (!isValid) {
    return;
  }

  e.preventDefault();

  const el = this.element;
  // const { short, long, dir, isReversed } = getState(el);
  const rows = getRows(el);
  const selectedRows = rows.filter((r) => r.isSelected);
  const firstSelectedRow = selectedRows[0];

  let newValues: string[] = [], 
      newShort = 0, 
      newLong = 0;

  for (const row of rows) {
    const isSelected = row.isSelected;
    if (isSelected) {
      continue;
    }

    // the row before the first selected row
    if (row.index === firstSelectedRow.index - 1) {
      newShort = row.startIndex;
      newLong = row.startIndex;
    }
    
    newValues.push(row.value);
  }

  let value = newValues.join("");

  // if last char is empty 
  // previous char is \n
  const removeLastLinebreak = selectedRows.length === 1
    && selectedRows[0].value === ""
    && rows[rows.length - 1].index === selectedRows[0].index;

  if (removeLastLinebreak) {
    value = value.substring(0, value.length - 1);
  }

  setState(el, {
    isReversed: false,
    short: newShort,
    long: newLong,
    dir: "none",
    value,
  });

  this.history.add();
}

export class Removify {
  parent: MTGA;

  constructor(parent: MTGA) {
    this.parent = parent;

    parent.modules.push(
      {
        name: "removify",
        onKeydown: onKeydown,
      }
    );
  }

  static defaults = {}
}