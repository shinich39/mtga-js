import type { MTGA } from "../index.js";
import { MTGAModule } from "../types/module.js";
import type { IPairs } from "../types/pair.js";
import { isComposingKeyboardEvent, parseKeyboardEvent } from "../utils/event.js";
import { getOpening, isClosing, isOpening, isPair } from "../utils/pair.js";

const getLeadingWhitespace = (value: string): string =>
  value.match(/^[^\S\r\n]*/) ? value.match(/^[^\S\r\n]*/)![0] : "";

const getOutdentedWhitespace = (value: string, indentUnit: string): string =>
  value.length >= indentUnit.length ? value.slice(0, value.length - indentUnit.length) : "";

const outdentClosingHandler = function (this: AutoIndentModule, e: KeyboardEvent): void {
  if (e.defaultPrevented) {
    return;
  }

  if (isComposingKeyboardEvent(e)) {
    return;
  }

  const { key, altKey, ctrlKey } = parseKeyboardEvent(e);
  const isValid = !ctrlKey && !altKey && isClosing(this.pairs, key);
  if (!isValid) {
    return;
  }

  const mtga = this.parent;
  const el = this.parent.element;
  const { indentUnit, pairs } = this;
  const { short, long, dir, isReversed } = mtga.getState();
  if (short !== long) {
    return;
  }

  const left = el.value.substring(0, short);
  const currentRow = left.split(/\r\n|\r|\n/).pop() || "";
  const leadingWhitespace = getLeadingWhitespace(currentRow);
  if (currentRow.trim().length > 0 || leadingWhitespace.length < indentUnit.length) {
    return;
  }

  const opening = getOpening(pairs, key);
  if (!opening) {
    return;
  }

  const beforeRow = currentRow.slice(0, currentRow.length - leadingWhitespace.length);
  const prevChar = beforeRow.charAt(beforeRow.length - 1);
  const currChar = el.value.charAt(short);

  if (currChar === key || isPair(pairs, prevChar, key)) {
    return;
  }

  e.preventDefault();

  const newShort = short - indentUnit.length + 1;
  const newValue =
    el.value.substring(0, short - indentUnit.length) + key + el.value.substring(long);

  mtga.setState({
    isReversed,
    short: newShort,
    long: newShort,
    dir,
    value: newValue,
  });
};

const enterHandler = function (this: AutoIndentModule, e: KeyboardEvent): void {
  if (e.defaultPrevented) {
    return;
  }

  if (isComposingKeyboardEvent(e)) {
    return;
  }

  const { key, altKey, ctrlKey } = parseKeyboardEvent(e);

  const isValid = !ctrlKey && !altKey && key === "Enter";
  if (!isValid) {
    return;
  }

  e.preventDefault();

  const mtga = this.parent;
  const el = this.parent.element;
  const { pairs, indentUnit } = this;
  const { short, long } = mtga.getState();

  const left = el.value.substring(0, short);
  const currentRow = left.split(/\r\n|\r|\n/).pop() || "";
  const baseIndent = getLeadingWhitespace(currentRow);
  const trimmedCurrentRow = currentRow.trimEnd();
  const prevChar = trimmedCurrentRow.charAt(trimmedCurrentRow.length - 1);
  const currChar = el.value.charAt(short);
  const isWhitespaceOnlyBeforeClosing = !currentRow.trim().length && isClosing(pairs, currChar);

  let center = "\n";
  const right = el.value.substring(long);
  const nextIndent = isOpening(pairs, prevChar) ? baseIndent + indentUnit : baseIndent;

  let newShort = short + 1;
  if (isWhitespaceOnlyBeforeClosing) {
    center = "\n";
  } else if (isClosing(pairs, currChar)) {
    const closingIndent = isOpening(pairs, prevChar)
      ? baseIndent
      : getOutdentedWhitespace(baseIndent, indentUnit);
    center += nextIndent + "\n" + closingIndent;
    newShort += nextIndent.length;
  } else {
    center += nextIndent;
    newShort += nextIndent.length;
  }

  const newValue = left + center + right;
  const newLong = newShort;

  mtga.setState(
    {
      isReversed: false,
      short: newShort,
      long: newLong,
      value: newValue,
    },
    false,
    true,
  );
};

const onKeydown = function (this: AutoIndentModule, e: KeyboardEvent): void {
  outdentClosingHandler.call(this, e);
  enterHandler.call(this, e);
};

export class AutoIndentModule extends MTGAModule {
  pairs: IPairs;
  indentUnit: string;

  constructor(parent: MTGA) {
    super(parent, AutoIndentModule.name);
    this.pairs = AutoIndentModule.defaults.pairs;
    this.indentUnit = AutoIndentModule.defaults.indentUnit;
  }

  static name = "AutoIndent";

  static defaults: {
    pairs: IPairs;
    indentUnit: string;
  } = {
    pairs: {
      "(": ")",
      "[": "]",
      "{": "}",
    },
    indentUnit: "  ",
  };

  onKeydown: typeof onKeydown = onKeydown;
}
