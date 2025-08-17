import { getState, IState, setState, parseKeyboardEvent } from "./utils.js";

export const isUndo = function(e: KeyboardEvent) {
  const { key, altKey, ctrlKey, shiftKey } = parseKeyboardEvent(e);
  return ctrlKey && !shiftKey && key.toLowerCase() === "z";
}

export const isRedo = function(e: KeyboardEvent) {
  const { key, altKey, ctrlKey, shiftKey } = parseKeyboardEvent(e);
  return ctrlKey && shiftKey && key.toLowerCase() === "z";
}

export class History {
  element: HTMLTextAreaElement;
  histories: IState[];
  index: number;
  maxCount: number;

  constructor(el: HTMLTextAreaElement) {
    this.element = el;
    this.histories = [];
    this.index = 1;
    this.maxCount = 390;
  }

  prune() {
    if (this.index > 1) {
      this.histories = this.histories.slice(0, this.histories.length - (this.index - 1));
      this.index = 1;
    }
  }

  add(prune = true) {
    const el = this.element;
    
    if (prune) {
      this.prune();
    } else if (this.index !== 1) {
      return;
    }

    const state = getState(el, true);

    this.histories.push(state);

    if (this.histories.length > this.maxCount) {
      this.histories.shift();
    }
  }

  prev() {
    if (this.index < this.histories.length) {
      this.index += 1;
    }
  }

  next() {
    if (this.index > 1) {
      this.index -= 1;
    }
  }

  curr() {
    return this.histories[this.histories.length - this.index];
  }

  undo(e: KeyboardEvent) {
    const el = this.element;

    this.prev();

    const h = this.curr();
    if (!h) {
      return;
    }

    setState(el, h);
  }

  redo(e: KeyboardEvent) {
    const el = this.element;

    this.next();

    const h = this.curr();
    if (!h) {
      return;
    }

    setState(el, h);
  }

}