import { MTGA } from "../mtga.js";
import { IModule } from "../types/module.js";
import { IPairs, isPair } from "../types/pair.js";
import { getState, parseKeyboardEvent } from "./utils.js";

const getDepth = function(pairs: IPairs, str: string) {
  const openingChars = Object.keys(pairs).join("");
  const closingChars = Object.values(pairs).join("");

  let result = 0;
  for (const char of str) {
    if (openingChars.includes(char)) {
      result++;
    } else if (closingChars.includes(char)) {
      result--;
    }
  }

  return Math.max(result, 0);
}

const getIndent = function(str: string) {
  const rows = str.split(/\r\n|\r|\n/);
  const currRow = rows[rows.length - 1];
  const currIndent = currRow.match(/^(\s*)/)?.[1] || "";
  return currIndent;
}

const onKeydown = function(this: MTGA, e: KeyboardEvent) {
  if (e.defaultPrevented) {
    return;
  }

  const module = this.getModule<AutoIndentModule>(AutoIndentModule.name);
  if (!module) {
    console.warn(`Module not found: ${AutoIndentModule.name}`);
    return;
  }

  const { key, altKey, ctrlKey, shiftKey } = parseKeyboardEvent(e);

  const isValid = !ctrlKey && !altKey && !shiftKey && key === "Enter";
  if (!isValid) {
    return;
  }

  e.preventDefault();

  const { pairs, indentUnit } = module;
  const el = this.element;
  const { short, long, dir, isReversed } = getState(el);

  const prevChar = el.value.charAt(short - 1);
  const currChar = el.value.charAt(short);

  const left = el.value.substring(0, short);
  let center = "\n";
  const right = el.value.substring(long);

  const rows = left.split(/\r\n|\r|\n/);
  const currRow = rows[rows.length - 1];
  const currIndent = getIndent(currRow);

  let newShort = short + 1;
  if (isPair(pairs, prevChar, currChar)) {
    center += currIndent + indentUnit + "\n" + currIndent;
    newShort += currIndent.length + indentUnit.length;
  } else {
    center += currIndent;
    newShort += currIndent.length;
  }
  
  const newValue = left + center + right;
  const newLong = newShort;
  
  this.setState({
    isReversed: false,
    short: newShort,
    long: newLong,
    dir: "none",
    value: newValue,
  });

  this.addHistory();
}

export class AutoIndentModule extends IModule {
  pairs: IPairs;
  indentUnit: string;

  constructor(parent: MTGA) {
    super(parent, AutoIndentModule.name);
    this.pairs = AutoIndentModule.defaults.pairs;
    this.indentUnit = AutoIndentModule.defaults.indentUnit;
  }

  onKeydown = onKeydown;

  static name = "AutoIndent";
  static defaults: {
    pairs: IPairs,
    indentUnit: string,
  } = {
    pairs: {
      "(": ")",
      "[": "]",
      "{": "}",
    },
    indentUnit: "  ",
  };
}