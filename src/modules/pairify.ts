import { MTGA } from "../mtga.js";
import { getState, setState, parseKeyboardEvent } from "./utils.js";

declare module "../mtga.js" {
  interface MTGA {
    pairify: Pairify;
  }
}

interface IPairs {
  [key: string]: string,
}

const isOpening = function(pairs: IPairs, value: string) {
  return Object.keys(pairs).includes(value);
}

const isClosing = function(pairs: IPairs, value: string) {
  return Object.values(pairs).includes(value);
}

const isPair = function(pairs: IPairs, opening: string, closing: string) {
  return pairs[opening] && pairs[opening] === closing;
}

const getOpening = function(pairs: IPairs, value: string) {
  return Object.entries(pairs).find((entry) => entry[1] === value)?.[0];
}

const getClosing = function(pairs: IPairs, value: string) {
  return pairs[value];
}

const closePairHandler = function(this: MTGA, e: KeyboardEvent) {
  if (e.defaultPrevented) {
    return;
  }
  
  const { key, altKey, ctrlKey, shiftKey } = parseKeyboardEvent(e);
  const el = this.element;
  const pairs = this.pairify.pairs;

  const isValid = !ctrlKey && !altKey && isOpening(pairs, key);
  if (!isValid) {
    return;
  }
  
  e.preventDefault();

  const { short, long, dir, isReversed } = getState(el);

  const isRange = short !== long;
  const opening = key;
  const closing = getClosing(pairs, opening);

  const left = el.value.substring(0, short);
  const center = el.value.substring(short, long);
  const right = el.value.substring(long);

  let newShort, 
      newLong,
      newValue;

  if (!isRange) {
    const start = (left + opening).length;
    newValue = left + opening + closing + right;
    newShort = start;
    newLong = start;
  } else {
    newValue = left + opening + center + closing + right;
    newShort = (left + opening).length;
    newLong = (left + opening + center).length;
  }

  setState(el, {
    isReversed,
    short: newShort,
    long: newLong,
    dir,
    value: newValue,
  });

  this.history.add();
}

const clearPairHandler = function(this: MTGA, e: KeyboardEvent) {
  if (e.defaultPrevented) {
    return;
  }
  
  const { key, altKey, ctrlKey, shiftKey } = parseKeyboardEvent(e);
  const isValidKey = !ctrlKey && !altKey && !shiftKey && key === "Backspace";
  if (!isValidKey) {
    return;
  }

  const el = this.element;
  const pairs = this.pairify.pairs;

  const { short, long, dir, isReversed } = getState(el);

  const isRange = short !== long;
  if (isRange) {
    return;
  }

  const prevChar = el.value.charAt(long - 1);
  const currChar = el.value.charAt(long);

  const isValid = isPair(pairs, prevChar, currChar);
  if (!isValid) {
    return;
  }
  
  e.preventDefault();

  const left = el.value.substring(0, long - 1);
  const right = el.value.substring(long + 1);

  const newValue = left + right;
  const newShort = left.length;
  const newLong = left.length;

  setState(el, {
    isReversed: false,
    short: newShort,
    long: newLong,
    dir: "forward",
    value: newValue,
  });

  this.history.add();
}

export class Pairify {
  parent: MTGA;
  pairs: IPairs;

  constructor(parent: MTGA) {
    this.parent = parent;
    this.pairs = { ...Pairify.defaults.pairs };

    parent.modules.push(
      {
        name: "pairifyClose",
        onKeydown: closePairHandler,
      },
      {
        name: "pairifyClear",
        onKeydown: clearPairHandler,
      }
    );
  }

  static defaults: {
    pairs: IPairs,
  } = {
    pairs: {
      "(": ")",
      "[": "]",
      "{": "}",
      "<": ">",
      "'": "'",
      "\"": "\"",
      "`": "`",
    },
  }
}