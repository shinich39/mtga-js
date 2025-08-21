import { MTGA } from "../mtga.js";
import { IModule } from "../types/module.js";
import { getClosing, IPairs, isOpening, isPair } from "../types/pair.js";
import { getState } from "../types/state.js";
import { parseKeyboardEvent } from "./utils.js";

const closePairHandler = function(this: AutoPairModule, e: KeyboardEvent) {
  if (e.defaultPrevented) {
    return;
  }

  const mtga = this.parent;
  const el = this.parent.element;
  const pairs = this.pairs;

  const { key, altKey, ctrlKey, shiftKey } = parseKeyboardEvent(e);

  // check close pair
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

  mtga.setState({
    isReversed,
    short: newShort,
    long: newLong,
    dir,
    value: newValue,
  });

  mtga.addHistory();
}

const clearPairHandler = function(this: AutoPairModule, e: KeyboardEvent) {
  if (e.defaultPrevented) {
    return;
  }

  const mtga = this.parent;
  const el = this.parent.element;
  const pairs = this.pairs;

  const { key, altKey, ctrlKey, shiftKey } = parseKeyboardEvent(e);

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

  mtga.setState({
    isReversed: false,
    short: newShort,
    long: newLong,
    dir: "forward",
    value: newValue,
  });

  mtga.addHistory();
}

const onKeydown = function(this: AutoPairModule, e: KeyboardEvent) {
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