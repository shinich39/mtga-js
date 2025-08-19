import { MTGA } from "../mtga.js";
import { IRow } from "../types/row.js";
import { setState, getRows, updateRows, parseKeyboardEvent } from "./utils.js";

declare module "../mtga.js" {
  interface MTGA {
    commentify: Commentify,
  }
}

const hasComment = function(selectedRows: IRow[]) {
  for (const r of selectedRows) {
    const _hasComment = r.value.startsWith("//");
    if (_hasComment) {
      return true;
    }
  }

  return false;
}

const commentifyHandler = function (this: MTGA, e: KeyboardEvent) {
  if (e.defaultPrevented) {
    return;
  }
  
  const { key, altKey, ctrlKey, shiftKey } = parseKeyboardEvent(e);
  const isValid = ctrlKey && !altKey && !shiftKey && key === "/";
  if (!isValid) {
    return;
  }

  e.preventDefault();

  const el = this.element;
  const { pattern, value } = this.commentify;

  const { rows, selectedRows } = getRows(el);
  const isMultiple = selectedRows.length > 1;
  const shouldRemove = hasComment(selectedRows);

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

export class Commentify {
  parent: MTGA;
  pattern: RegExp;
  value: string;

  constructor(parent: MTGA) {
    this.parent = parent;
    this.pattern = Commentify.defaults.pattern;
    this.value = Commentify.defaults.value;

    parent.modules.push(
      {
        name: "Commentify",
        onKeydown: commentifyHandler,
      }
    );
  }

  static defaults = {
    pattern: /^\/\/\s?/,
    value:  "// ",
  }
}