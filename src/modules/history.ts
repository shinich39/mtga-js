import { MTGA } from "../mtga.js";
import { IModule } from "../types/module.js";
import { IState } from "../types/state.js";
import { getState, parseKeyboardEvent } from "./utils.js";

const onKeydown = function(this: MTGA, e: KeyboardEvent) {
  if (e.defaultPrevented) {
    return;
  }

  const { key, altKey, ctrlKey, shiftKey } = parseKeyboardEvent(e);
  
  const isValid = ctrlKey && !altKey && key.toLowerCase() === "z";
  if (!isValid) {
    return;
  }

  e.preventDefault();

  const module = this.getModule<HistoryModule>(HistoryModule.name);
  if (!module) {
    console.warn(`Module not found: ${HistoryModule.name}`);
    return;
  }

  let h;

  // undo
  if (!shiftKey) {
    h = module.prev();
  } // redo
  else {
    h = module.next();
  }

  if (h) {
    this.setState(h);
  }
}

const onKeyup = function(this: MTGA, e: KeyboardEvent) {
  const keydownState = this._keydownState;
  
  this._clearKeydownState();

  if (!keydownState) {
    return;
  }

  const el = this.element;
  const prevValue = keydownState.value;
  const currValue = el.value;

  // insert
  if (prevValue !== currValue) {
    this.addHistory();
  } // move
  else {
    const prevState = keydownState.state;
    const currState = getState(el);
    if (
      prevState.short !== currState.short ||
      prevState.long !== currState.long
    ) {
      this.addHistory(false);
    }
  }
}

export class HistoryModule extends IModule {
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

  onKeydown = onKeydown;
  onKeyup = onKeyup;

  prune() {
    if (this._i > 1) {
      this.items = this.items.slice(0, this.items.length - (this._i - 1));
      this._i = 1;
    }
  }

  add(withPrune = true) {
    const el = this.parent.element;
    
    if (withPrune) {
      this.prune();
    } else if (this._i !== 1) {
      return;
    }

    const prevState = this.items[this.items.length - 1];
    const currState = getState(el, true);

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
  }

  prev() {
    if (this._i < this.items.length) {
      this._i += 1;
    }
    return this.curr();
  }

  next() {
    if (this._i > 1) {
      this._i -= 1;
    }
    return this.curr();
  }

  curr() {
    return this.items[this.items.length - this._i];
  }
}