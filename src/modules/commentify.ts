import { getState, setState, getRows, IRow, updateRows } from "./utils.js";

const hasComment = function(selectedRows: IRow[]) {
  for (const r of selectedRows) {
    const _hasComment = r.value.startsWith("//");
    if (_hasComment) {
      return true;
    }
  }

  return false;
}

export class Commentify {
  element: HTMLTextAreaElement;
  key: string;
  removePattern: RegExp;
  newValue: string;

  constructor(el: HTMLTextAreaElement) {
    this.element = el;
    this.key = "/";
    this.removePattern = /^\/\/\s?/;
    this.newValue = "// ";
  }

  isValid(e: KeyboardEvent) {
    const { key, altKey, shiftKey } = e;
    const ctrlKey = e.ctrlKey || e.metaKey;
    return ctrlKey && !altKey && !shiftKey && key === this.key;
  }

  exec(e: KeyboardEvent) {
    const el = this.element;
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