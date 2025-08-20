import { MTGA } from "../mtga.js";
import { setState, getRows, parseKeyboardEvent, getState } from "./utils.js";

declare module "../mtga.js" {
  interface MTGA {
    indentify: Indentify;
  }
}

const onKeydown = function (this: MTGA, e: KeyboardEvent) {
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

  const rows = getRows(el);
  const { short, long, dir, isReversed } = getState(el);
  const selectedRows = rows.filter((r) => r.isSelected);
  const isMultiple = selectedRows.length > 1;
  const shouldRemove = e.shiftKey;

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
        onKeydown: onKeydown,
      }
    );
  }

  static defaults = {
    pattern: /^[^\S\n\r][^\S\n\r]?/,
    value: "  ",
  }
}