import { getState, setState, parseKeyboardEvent } from "./utils.js";

export interface IPairs {
  [key: string]: string,
}

const isOpening = function(pairs: IPairs, value: string) {
  return Object.keys(pairs).includes(value);
}

const isClosing = function(pairs: IPairs, value: string) {
  return Object.values(pairs).includes(value);
}

const getOpening = function(pairs: IPairs, value: string) {
  return Object.entries(pairs).find((entry) => entry[1] === value)?.[0];
}

const getClosing = function(pairs: IPairs, value: string) {
  return pairs[value];
}

export class AutoPairing {
  element: HTMLTextAreaElement;
  pairs: IPairs;
  
  constructor(
    el: HTMLTextAreaElement, 
    pairs: IPairs
  ) {
    this.element = el;
    this.pairs = pairs;
  }

  isInsert(e: KeyboardEvent) {
    const { key, altKey, ctrlKey, shiftKey } = parseKeyboardEvent(e);
    return !altKey && !ctrlKey && isOpening(this.pairs, key);
  }

  isDelete(e: KeyboardEvent) {
    const el = this.element;
    const pairs = this.pairs;

    const { key, altKey, ctrlKey, shiftKey } = parseKeyboardEvent(e);
    if (altKey || ctrlKey || shiftKey || key !== "Backspace") {
      return false;
    }

    const { short, long, dir, isReversed } = getState(el);

    const isRange = short !== long;
    if (isRange) {
      return false;
    }

    const currChar = el.value.charAt(long - 1);
    const nextChar = el.value.charAt(long);
    return isOpening(pairs, currChar) && getClosing(pairs, currChar) === nextChar;
  }

  insert(e: KeyboardEvent) {
    const el = this.element;
    const pairs = this.pairs;
    const { key } = parseKeyboardEvent(e);
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
  }

  delete(e: KeyboardEvent) {
    const el = this.element;
    const pairs = this.pairs;
    const { long } = getState(el);

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
  }

}