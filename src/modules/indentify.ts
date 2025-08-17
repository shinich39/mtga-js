import { getState, setState, getRows, IRow, updateRows } from "./utils.js";

export class Indentify {
  element: HTMLTextAreaElement;
  key: string;
  removePattern: RegExp;
  newValue: string;

  constructor(el: HTMLTextAreaElement) {
    this.element = el;
    this.key = "Tab";
    this.removePattern = /^[^\S\n\r][^\S\n\r]?/;
    this.newValue = "  ";
  }

  isValid(e: KeyboardEvent) {
    const { key, altKey, shiftKey } = e;
    const ctrlKey = e.ctrlKey || e.metaKey;
    return !ctrlKey && !altKey && key === this.key;
  }

  exec(e: KeyboardEvent) {
    const el = this.element;
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
          return row.value.replace(this.removePattern, "");
        } else if (isEmpty) {
          return row.value;
        } else {
          return this.newValue + row.value;
        }
      } else {
        if (shouldRemove) {
          return row.value.replace(this.removePattern, "");
        } else {
          return this.newValue + row.value;
        }
      }
    });

    setState(el, state);
  }
}