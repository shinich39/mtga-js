import { MTGA } from "../mtga.js";
import { MTGAModule } from "../types/module.js";
import { getRows } from "../types/row.js";
import { parseKeyboardEvent } from "./utils.js";

// text...
const singleLineHandler = function (this: CommentModule, e: KeyboardEvent) {
  if (e.defaultPrevented) {
    return;
  }
  
  const mtga = this.parent;
  const el = this.parent.element;

  const { key, altKey, ctrlKey, shiftKey } = parseKeyboardEvent(e);
  const isValid = ctrlKey && !altKey && !shiftKey && key === "/";
  if (!isValid) {
    return;
  }

  e.preventDefault();

  const { pattern, value } = this;

  const rows = getRows(el);
  const { short, long, dir, isReversed } = mtga.getState();
  const selectedRows = rows.filter((r) => r.isSelected);
  const selectedEmptyRows = selectedRows.filter((r) => !r.value.trim());
  const isMultiple = selectedRows.length > 1;
  const isIgnoreEmptyRows = isMultiple && selectedRows.length !== selectedEmptyRows.length;

  let shouldRemove = true;
  for (const r of selectedRows) {
    if (
      isIgnoreEmptyRows 
      && selectedEmptyRows.some((_r) => _r.index === r.index)
    ) {
      continue;
    }

    if (!r.value.startsWith("//")) {
      shouldRemove = false;
      break;
    }
  }

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
      if (shouldRemove) {
        newValue = row.value.replace(pattern, "");
      } else if (isIgnoreEmptyRows && selectedEmptyRows.some((r) => r.index === row.index)) {
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

  mtga.setState({
    isReversed,
    short: newShort,
    long: newLong,
    dir,
    value: newValues.join(""),
  }, false, true);
}

/** text... */
const multiLineHandler = function (this: CommentModule, e: KeyboardEvent) {
  if (e.defaultPrevented) {
    return;
  }

  const mtga = this.parent;
  const el = this.parent.element;

  const { key, altKey, ctrlKey, shiftKey } = parseKeyboardEvent(e);
  const isValid = !ctrlKey && !altKey && shiftKey && key === "*";
  if (!isValid) {
    return;
  }

  const { short, long, dir, isReversed } = mtga.getState();
  const isRange = short !== long;
  if (isRange) {
    return;
  }

  const prevChar = el.value.charAt(short - 1);
  if (prevChar !== "/") {
    return;
  }

  e.preventDefault();
  
  const newShort = short + 1,
        newLong = long + 1;

  const newValue = el.value.substring(0, short) 
    + "**/" 
    + el.value.substring(long); 

  mtga.setState({
    isReversed,
    short: newShort,
    long: newLong,
    dir,
    value: newValue,
  });
}

const onKeydown = function(this: CommentModule, e: KeyboardEvent): void {
  singleLineHandler.call(this, e);
  multiLineHandler.call(this, e);
}

export class CommentModule extends MTGAModule {
  pattern: RegExp;
  value: string;

  constructor(parent: MTGA) {
    super(parent, CommentModule.name);
    this.pattern = CommentModule.defaults.pattern;
    this.value = CommentModule.defaults.value;
  }

  static name = "Comment";

  static defaults: {
    pattern: RegExp,
    value: string
  } = {
    pattern: /^\/\/\s?/,
    value:  "// ",
  }

  onKeydown: typeof onKeydown = onKeydown;
}