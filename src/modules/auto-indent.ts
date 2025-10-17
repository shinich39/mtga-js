import { MTGA } from "../mtga.js";
import { MTGAModule } from "../types/module.js";
import { IPairs, isClosing, } from "../types/pair.js";
import { getIndent, parseKeyboardEvent } from "./utils.js";

const onKeydown = function(this: AutoIndentModule, e: KeyboardEvent) {
  if (e.defaultPrevented) {
    return;
  }

  const { key, altKey, ctrlKey, shiftKey } = parseKeyboardEvent(e);

  const isValid = !ctrlKey && !altKey && key === "Enter";
  if (!isValid) {
    return;
  }

  e.preventDefault();

  const mtga = this.parent;
  const el = this.parent.element;
  const { pairs, indentUnit } = this;
  const { short, long, dir, isReversed } = mtga.getState();

  // const prevChar = el.value.charAt(short - 1);
  const currChar = el.value.charAt(short);

  const left = el.value.substring(0, short);
  let center = "\n";
  const right = el.value.substring(long);

  // calculate indent size
  const leftRows = left.split(/\r\n|\r|\n/);
  const currIndent = getIndent(pairs, indentUnit, leftRows);

  let newShort = short + 1;
  if (isClosing(pairs, currChar)) {
    const nextIndent = currIndent.substring(0, currIndent.length - indentUnit.length);
    center += currIndent + "\n" + nextIndent;
    newShort += currIndent.length;
  } else {
    center += currIndent;
    newShort += currIndent.length;
  }
  
  const newValue = left + center + right;
  const newLong = newShort;
  
  mtga.setState({
    isReversed: false,
    short: newShort,
    long: newLong,
    value: newValue,
  }, false, true);
}

export class AutoIndentModule extends MTGAModule {
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