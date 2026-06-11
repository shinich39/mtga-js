import type { MTGA } from "../index.js";
import { MTGAModule } from "../types/module.js";
import { parseKeyboardEvent } from "../utils/event.js";
import { getRows } from "../utils/row.js";

const getLeadingWhitespace = (value: string): string =>
  value.match(/^[^\S\r\n]*/) ? value.match(/^[^\S\r\n]*/)![0] : "";

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getCommentParts = (value: string, baseIndent: string) => {
  const base = value.startsWith(baseIndent) ? baseIndent : "";
  const rest = value.substring(base.length);

  return {
    base,
    rest,
  };
};

const getSharedLeadingWhitespace = (values: string[]): string => {
  const indents = values
    .filter((value) => value.trim())
    .map((value) => getLeadingWhitespace(value));

  if (indents.length === 0) {
    return "";
  }

  const minSize = Math.min(...indents.map((indent) => indent.length));
  return indents.find((indent) => indent.length === minSize) || "";
};

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
  const targetRows = isIgnoreEmptyRows ? selectedRows.filter((r) => r.value.trim()) : selectedRows;
  const sharedLeadingWhitespace = getSharedLeadingWhitespace(targetRows.map((row) => row.value));
  const sharedCommentPattern = new RegExp(
    `^${escapeRegExp(sharedLeadingWhitespace)}${pattern.source}`,
  );

  let shouldRemove = true;
  for (const r of targetRows) {
    if (!sharedCommentPattern.test(r.value)) {
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

    let newValue: string;
    if (isMultiple) {
      if (shouldRemove) {
        newValue = row.value.replace(sharedCommentPattern, sharedLeadingWhitespace);
      } else if (isIgnoreEmptyRows && selectedEmptyRows.some((r) => r.index === row.index)) {
        newValue = row.value;
      } else {
        const { base, rest } = getCommentParts(row.value, sharedLeadingWhitespace);
        newValue = `${base}${value}${rest}`;
      }
    } else {
      const rowLeadingWhitespace = getLeadingWhitespace(row.value);
      const rowCommentPattern = new RegExp(
        `^${escapeRegExp(rowLeadingWhitespace)}${pattern.source}`,
      );
      if (shouldRemove) {
        newValue = row.value.replace(rowCommentPattern, rowLeadingWhitespace);
      } else {
        const { base, rest } = getCommentParts(row.value, rowLeadingWhitespace);
        newValue = `${base}${value}${rest}`;
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

  mtga.setState(
    {
      isReversed,
      short: newShort,
      long: newLong,
      dir,
      value: newValues.join(""),
    },
    false,
    true,
  );
};

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

  const newValue = el.value.substring(0, short) + "**/" + el.value.substring(long);

  mtga.setState({
    isReversed,
    short: newShort,
    long: newLong,
    dir,
    value: newValue,
  });
};

const onKeydown = function (this: CommentModule, e: KeyboardEvent): void {
  singleLineHandler.call(this, e);
  multiLineHandler.call(this, e);
};

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
    pattern: RegExp;
    value: string;
  } = {
    pattern: /\/\/\s?/,
    value: "// ",
  };

  onKeydown: typeof onKeydown = onKeydown;
}
