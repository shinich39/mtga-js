import { MTGA } from "../mtga.js";
import { IModule } from "../types/module.js";
import { IPairs } from "../types/pair.js";
import { getState, parseKeyboardEvent } from "./utils.js";

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

  const module = this.getModule<AutoPairModule>(AutoPairModule.name);
  if (!module) {
    console.warn(`Module not found: ${AutoPairModule.name}`);
    return;
  }

  const pairs = module.pairs;

  const { key, altKey, ctrlKey, shiftKey } = parseKeyboardEvent(e);

  // check close pair
  const isValid = !ctrlKey && !altKey && isOpening(pairs, key);
  if (!isValid) {
    return;
  }

  e.preventDefault();

  const el = this.element;
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

  this.setState({
    isReversed,
    short: newShort,
    long: newLong,
    dir,
    value: newValue,
  });

  this.addHistory();
}

const clearPairHandler = function(this: MTGA, e: KeyboardEvent) {
  if (e.defaultPrevented) {
    return;
  }

  const module = this.getModule<AutoPairModule>(AutoPairModule.name);
  if (!module) {
    console.warn(`Module not found: ${AutoPairModule.name}`);
    return;
  }

  const pairs = module.pairs;

  const { key, altKey, ctrlKey, shiftKey } = parseKeyboardEvent(e);
  const el = this.element;

  const isRemoveKey = !ctrlKey && !altKey && !shiftKey && key === "Backspace";
  if (!isRemoveKey) {
    return;
  }

  const { short, long } = getState(el);

  const isRange = short !== long;
  if (isRange) {
    return;
  }

  const prevChar = el.value.charAt(short - 1);
  const currChar = el.value.charAt(short);

  if (!isPair(pairs, prevChar, currChar)) {
    return;
  }

  e.preventDefault();

  const left = el.value.substring(0, short - 1);
  const right = el.value.substring(short + 1);

  const newValue = left + right;
  const newShort = left.length;
  const newLong = left.length;

  this.setState({
    isReversed: false,
    short: newShort,
    long: newLong,
    dir: "forward",
    value: newValue,
  });

  this.addHistory();
}

const onKeydown = function(this: MTGA, e: KeyboardEvent) {
  closePairHandler.call(this, e);
  clearPairHandler.call(this, e);
}

export class AutoPairModule extends IModule {
  pairs: IPairs;

  constructor(parent: MTGA) {
    super(parent, AutoPairModule.name);
    this.pairs = { ...AutoPairModule.defaults.pairs };
  }

  onKeydown = onKeydown;

  static name = "AutoPair";
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