import { MTGA } from "../mtga.js";
import { MTGAModule } from "../types/module.js";
import type { IState } from "../types/state.js";
import { parseKeyboardEvent } from "./utils.js";

const onKeydown = function(this: HistoryModule, e: KeyboardEvent): void {
  if (e.defaultPrevented) {
    return;
  }

  const mtga = this.parent;

  const { key, altKey, ctrlKey, shiftKey } = parseKeyboardEvent(e);
  
  const isValid = ctrlKey && !altKey && key.toLowerCase() === "z";
  if (!isValid) {
    return;
  }

  e.preventDefault();

  let h;

  // undo
  if (!shiftKey) {
    h = this.prev();
  } // redo
  else {
    h = this.next();
  }

  if (h) {
    mtga.setState(h, false, false);
  }
}

const onKeyup = function(this: HistoryModule, e: KeyboardEvent): void {
  const mtga = this.parent;

  const keydownState = mtga._keydownState;
  
  mtga._removeKeydownState();

  if (!keydownState) {
    return;
  }

  const el = mtga.element;
  const prevValue = keydownState.value;
  const currValue = el.value;

  // insert
  if (prevValue !== currValue) {
    mtga.addHistory();
  } // move
  else {
    const prevState = keydownState.state;
    const currState = mtga.getState();
    if (
      prevState.short !== currState.short ||
      prevState.long !== currState.long
    ) {
      mtga.addHistory(false);
    }
  }
}

export class HistoryModule extends MTGAModule {
  items: IState[];
  maxCount: number;
  _i: number;

  constructor(parent: MTGA) {
    super(parent, HistoryModule.name, 0);
    this.items = [];
    this.maxCount = HistoryModule.defaults.maxCount;
    this._i = 1; // history index
  }

  static name = "History";

  static defaults = {
    maxCount: 390,
  };

  onKeydown: typeof onKeydown = onKeydown;
  onKeyup: typeof onKeydown = onKeyup;

  prune(): void {
    if (this._i > 1) {
      this.items = this.items.slice(0, this.items.length - (this._i - 1));
      this._i = 1;
    }
  }

  add(withPrune = true): void {
    const mtga = this.parent;
    
    if (withPrune) {
      this.prune();
    } else if (this._i !== 1) {
      return;
    }

    const prevState = this.items[this.items.length - 1];
    const currState = mtga.getState(true);

    const isChanged = !prevState ||
      prevState.short !== currState.short ||
      prevState.long !== currState.long ||
      prevState.value !== currState.value;

    if (!isChanged) {
      return;
    }

    this.items.push(currState);

    if (this.items.length > this.maxCount) {
      this.items.shift();
    }

    // console.log(`history saved: ${this.items.length}`);
  }

  remove(): void {
    this.items.pop();
  }

  prev(): IState | undefined {
    if (this._i < this.items.length) {
      this._i += 1;
    }
    return this.curr();
  }

  next(): IState | undefined {
    if (this._i > 1) {
      this._i -= 1;
    }
    return this.curr();
  }

  curr(): IState | undefined {
    return this.items[this.items.length - this._i];
  }
}