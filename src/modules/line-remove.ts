import { MTGA } from "../mtga.js";
import { MTGAModule } from "../types/module.js";
import { getRows } from "../types/row.js";
import { getState } from "../types/state.js";
import { parseKeyboardEvent } from "./utils.js";

const onKeydown = function (this: LineRemoveModule, e: KeyboardEvent) {
  if (e.defaultPrevented) {
    return;
  }

  const mtga = this.parent;
  const el = this.parent.element;

  const { key, altKey, ctrlKey, shiftKey } = parseKeyboardEvent(e);
  const isValid = ctrlKey && !altKey && shiftKey && key.toLowerCase() === "k";
  if (!isValid) {
    return;
  }

  e.preventDefault();

  // const { short, long, dir, isReversed } = getState(el);
  const rows = getRows(el);
  const selectedRows = rows.filter((r) => r.isSelected);
  const firstSelectedRow = selectedRows[0];
  const lastSelectedRow = selectedRows[selectedRows.length - 1];

  let newValues: string[] = [], 
      newShort = 0, 
      newLong = 0,
      maxRowIndex = 0;

  for (const row of rows) {
    if (row.isSelected) {
      continue;
    }

    // the row before the first selected row
    if (row.index === firstSelectedRow.index - 1) {
      newShort = row.endIndex;
      newLong = row.endIndex;
    } else if (row.index === lastSelectedRow.index + 1) {
      maxRowIndex = row.value.length - 1;
    }
    
    newValues.push(row.value);
  }

  const rowIndex = Math.min(
    Math.max(lastSelectedRow.selectionStart, lastSelectedRow.selectionEnd - 1), 
    maxRowIndex,
  );

  newShort += rowIndex;
  newLong += rowIndex;

  let value = newValues.join("");

  // if last char is empty 
  // previous char is \n
  const removeLastLinebreak = selectedRows.length === 1
    && selectedRows[0].value === ""
    && rows[rows.length - 1].index === selectedRows[0].index;

  if (removeLastLinebreak) {
    value = value.substring(0, value.length - 1);
  }

  mtga.addHistory();
  
  mtga.setState({
    isReversed: false,
    short: newShort,
    long: newLong,
    value,
  });

  mtga.addHistory();
}

export class LineRemoveModule extends MTGAModule {
  constructor(parent: MTGA) {
    super(parent, LineRemoveModule.name);
  }

  onKeydown = onKeydown;

  static name = "LineRemove";

  static defaults = {};
}