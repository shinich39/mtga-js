import { MTGA } from "../mtga.js";
import { MTGAModule } from "../types/module.js";
import { IPairs, isClosing, isPair } from "../types/pair.js";
import { parseKeyboardEvent } from "./utils.js";

const createIndent = function(unit: string, size: number) {
  return unit.repeat(Math.ceil(size / unit.length)).slice(0, size);
}

const getIndent = function(pairs: IPairs, indentUnit: string, rows: string[]) {
  const openingChars = Object.keys(pairs).join("");
  const closingChars = Object.values(pairs).join("");

  for (let i = rows.length - 1; i >= 0; i--) {
    const row = rows[i];
    for (let j = row.length - 1; j >= 0; j--) {
      const ch = row[j];

      if (closingChars.includes(ch)) {
        const depth = (row.match(/^\s*/)?.[0].length || 0);
        return createIndent(indentUnit, depth);
      }

      if (openingChars.includes(ch)) {
        const depth = (row.match(/^\s*/)?.[0].length || 0) + indentUnit.length;
        return createIndent(indentUnit, depth);
      }
    }
  }

  return "";
}

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

  const rows = left.split(/\r\n|\r|\n/);
  const currIndent = getIndent(pairs, indentUnit, rows);

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
  
  // mtga.addHistory();

  mtga.setState({
    isReversed: false,
    short: newShort,
    long: newLong,
    value: newValue,
  });

  mtga.addHistory();
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