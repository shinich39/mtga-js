import type { MTGA } from "../index.js";
import { MTGAModule } from "../types/module.js";
import type { IPairs } from "../types/pair.js";
import { isComposingKeyboardEvent, parseKeyboardEvent } from "../utils/event.js";
import { getIndent, getOpening, isClosing, isOpening, isPair } from "../utils/pair.js";

const getLeadingWhitespace = (value: string): string =>
  value.match(/^[^\S\r\n]*/) ? value.match(/^[^\S\r\n]*/)![0] : "";

const getOutdentedWhitespace = (value: string, indentUnit: string): string =>
  value.length >= indentUnit.length ? value.slice(0, value.length - indentUnit.length) : "";

const getCurrentRow = (value: string): string => value.split(/\r\n|\r|\n/).pop() || "";

const getEnterInsertion = ({
  left,
  currentRow,
  currChar,
  pairs,
  indentUnit,
}: {
  left: string;
  currentRow: string;
  currChar: string;
  pairs: IPairs;
  indentUnit: string;
}): {
  center: string;
  caretOffset: number;
} => {
  if (!currentRow.trim().length && isClosing(pairs, currChar)) {
    return {
      center: "\n",
      caretOffset: 1,
    };
  }

  if (isClosing(pairs, currChar)) {
    const innerIndent = getIndent(pairs, indentUnit, left.split(/\r\n|\r|\n/));
    const closingIndent = getOutdentedWhitespace(innerIndent, indentUnit);

    return {
      center: `\n${innerIndent}\n${closingIndent}`,
      caretOffset: 1 + innerIndent.length,
    };
  }

  const baseIndent = getLeadingWhitespace(currentRow);
  const prevChar = currentRow.trimEnd().slice(-1);
  const nextIndent = isOpening(pairs, prevChar) ? baseIndent + indentUnit : baseIndent;

  return {
    center: `\n${nextIndent}`,
    caretOffset: 1 + nextIndent.length,
  };
};

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
  const currentRow = getCurrentRow(left);
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
  const currentRow = getCurrentRow(left);
  const currChar = el.value.charAt(short);
  const right = el.value.substring(long);
  const { center, caretOffset } = getEnterInsertion({
    left,
    currentRow,
    currChar,
    pairs,
    indentUnit,
  });

  const newValue = left + center + right;
  const newShort = short + caretOffset;

  mtga.setState(
    {
      isReversed: false,
      short: newShort,
      long: newShort,
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
