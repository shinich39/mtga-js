import { MTGA } from "../mtga.js";
import { setState, getRows, updateRows, parseKeyboardEvent } from "./utils.js";

declare module "../mtga.js" {
  interface MTGA {
    indentify: Indentify;
  }
}

const indentifyHandler = function (this: MTGA, e: KeyboardEvent) {
  if (e.defaultPrevented) {
    return;
  }
  
  const { key, altKey, ctrlKey, shiftKey } = parseKeyboardEvent(e);
  const isValid = !ctrlKey && !altKey && key === "Tab";
  if (!isValid) {
    return;
  }

  e.preventDefault();

  const el = this.element;
  const { pattern, value } = this.indentify;

  const { rows, selectedRows } = getRows(el);
  const isMultiple = selectedRows.length > 1;
  const shouldRemove = e.shiftKey;
  const state = updateRows(el, rows, (row) => {
    const isSelected = row.selectionStart > -1 || row.selectionEnd > -1;
    if (!isSelected) {
      return row.value;
    }

    if (isMultiple) {
      const isEmpty = !row.value.trim();
      if (shouldRemove) {
        return row.value.replace(pattern, "");
      } else if (isEmpty) {
        return row.value;
      } else {
        return value + row.value;
      }
    } else {
      if (shouldRemove) {
        return row.value.replace(pattern, "");
      } else {
        return value + row.value;
      }
    }
  });

  setState(el, state);

  this.history.add();
}

export class Indentify {
  parent: MTGA;
  pattern: RegExp;
  value: string;

  constructor(parent: MTGA) {
    this.parent = parent;
    this.pattern = Indentify.defaults.pattern;
    this.value = Indentify.defaults.value;

    parent.modules.push(
      {
        name: "Indentify",
        onKeydown: indentifyHandler,
      }
    );
  }

  static defaults = {
    pattern: /^[^\S\n\r][^\S\n\r]?/,
    value: "  ",
  }
}