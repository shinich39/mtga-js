import { MTGA } from "../mtga.js";
import { IRow } from "../types/row.js";
import { setState, getRows, parseKeyboardEvent, getState } from "./utils.js";

declare module "../mtga.js" {
  interface MTGA {
    commentify: Commentify,
  }
}

const hasComment = function(selectedRows: IRow[]) {
  for (const r of selectedRows) {
    const ok = r.value.startsWith("//");
    if (ok) {
      return true;
    }
  }

  return false;
}

const isCommentified = function(selectedRows: IRow[]) {
  for (const r of selectedRows) {
    const ok = r.value.startsWith("//");
    if (!ok) {
      return false;
    }
  }

  return true;
}

const onKeydown = function (this: MTGA, e: KeyboardEvent) {
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

  const rows = getRows(el);
  const { short, long, dir, isReversed } = getState(el);
  const selectedRows = rows.filter((r) => r.isSelected);
  const isMultiple = selectedRows.length > 1;
  const shouldRemove = isCommentified(selectedRows);

  let newShort = short,
      newLong = long;

  const newValues: string[] = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const { startIndex, endIndex } = row;

    const origValue = row.value;

    const isSelected = row.isSelected;
    if (!isSelected) {
      newValues.push(row.value);
      continue;
    }

    let newValue;
    if (isMultiple) {
      const isEmpty = !row.value.trim();
      if (shouldRemove) {
        newValue = row.value.replace(pattern, "");
      } else if (isEmpty) {
        newValue = row.value;
      } else {
        newValue = value + row.value;
      }
    } else {
      if (shouldRemove) {
        newValue = row.value.replace(pattern, "");
      } else {
        newValue = value + row.value;
      }
    }

    const diff = newValue.length - origValue.length;

    if (short >= startIndex && short < endIndex) {
      if (diff >= 0) {
        newShort += diff;
        newLong += diff;
      } else {
        newShort += Math.max(diff, startIndex - short);
        newLong += Math.max(diff, startIndex - long);
      }
    } else if (long >= startIndex && short < endIndex) {
      if (diff >= 0) {
        newLong += diff;
      } else {
        newLong += Math.max(diff, startIndex - long);
      }
    } else {
      newShort += diff;
      newLong += diff;
    }

    newValues.push(newValue);
  }

  setState(el, {
    isReversed,
    short: newShort,
    long: newLong,
    dir,
    value: newValues.join(""),
  });

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
        name: "commentify",
        onKeydown: onKeydown,
      }
    );
  }

  static defaults = {
    pattern: /^\/\/\s?/,
    value:  "// ",
  }
}