import { MTGA } from "../mtga.js";
import { IState } from "../types/state.js";
import { getState, parseKeyboardEvent, setState } from "./utils.js";

declare module "../mtga.js" {
  interface MTGA {
    history: History;
  }
}

const undoHandler = function(this: MTGA, e: KeyboardEvent) {
  if (e.defaultPrevented) {
    return;
  }

  const { key, altKey, ctrlKey, shiftKey } = parseKeyboardEvent(e);

  const isValid = ctrlKey && !altKey && !shiftKey && key.toLowerCase() === "z";
  if (!isValid) {
    return;
  }

  e.preventDefault();
  
  const el = this.element;

  const h = this.history.prev();
  if (!h) {
    return;
  }

  setState(el, h);
}

const redoHandler = function(this: MTGA, e: KeyboardEvent) {
  if (e.defaultPrevented) {
    return;
  }

  const { key, altKey, ctrlKey, shiftKey } = parseKeyboardEvent(e);
  
  const isValid = ctrlKey && !altKey && shiftKey && key.toLowerCase() === "z";
  if (!isValid) {
    return;
  }

  e.preventDefault();
  
  const el = this.element;

  const h = this.history.next();
  if (!h) {
    return;
  }

  setState(el, h);
}

const pushHandler = function(this: MTGA, e: KeyboardEvent) {
  const keydownState = this._keydownState;
  
  this._clearKeydownState();

  if (!keydownState) {
    return;
  }

  const el = this.element;
  const prevValue = keydownState.value;

  // insert
  if (prevValue !== el.value) {
    this.history.add();
  } // move
  else {
    const prevState = keydownState.state;
    const currState = getState(el);
    if (
      prevState.short !== currState.short ||
      prevState.long !== currState.long
    ) {
      this.history.add(false);
    }
  }
}

export class History {
  parent: MTGA;
  items: IState[];
  index: number;
  maxCount: number;

  constructor(parent: MTGA) {
    this.parent = parent;
    this.items = [];
    this.index = 1;
    this.maxCount = History.defaults.maxCount;

    parent.modules.push(
      {
        name: "historyUndo",
        onKeydown: undoHandler,
      },
      {
        name: "historyRedo",
        onKeydown: redoHandler,
      },
      {
        name: "historyPush",
        onKeyup: pushHandler,
      },
    );
  }

  static defaults = {
    maxCount: 390,
  };

  prune() {
    if (this.index > 1) {
      this.items = this.items.slice(0, this.items.length - (this.index - 1));
      this.index = 1;
    }
  }

  add(withPrune = true) {
    const el = this.parent.element;
    
    if (withPrune) {
      this.prune();
    } else if (this.index !== 1) {
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
    if (this.index < this.items.length) {
      this.index += 1;
    }
    return this.curr();
  }

  next() {
    if (this.index > 1) {
      this.index -= 1;
    }
    return this.curr();
  }

  curr() {
    return this.items[this.items.length - this.index];
  }
}