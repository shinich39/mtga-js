import { Pairify } from "./modules/pairify.js";
import { debounce, getState, setState } from "./modules/utils.js";
import { Commentify } from "./modules/commentify.js";
import { Indentify } from "./modules/indentify.js";
import { Tagify } from "./modules/tagify.js";
import { IModule } from "./types/module.js";
import { IKeydownState, IState } from "./types/state.js";
import { History } from "./modules/history.js";
import { Breakify } from "./modules/breakify.js";
import { Removify } from "./modules/removify.js";

export { Pairify } from "./modules/pairify.js";
export { Breakify } from "./modules/breakify.js";
export { Removify } from "./modules/removify.js";
export { Commentify } from "./modules/commentify.js";
export { Indentify } from "./modules/indentify.js";
export { Tagify } from "./modules/tagify.js";
export { History } from "./modules/history.js";

export class MTGA {
  element: HTMLTextAreaElement;
  modules: IModule[];

  _keydownState: IKeydownState | null;
  _keydownEvent: (e: KeyboardEvent) => void;
  _keyupEvent: (e: KeyboardEvent) => void;
  _focusEvent: (e: FocusEvent) => void;
  _blurEvent: (e: FocusEvent) => void;
  
  constructor(el: HTMLTextAreaElement) {
    this.element = el;
    this.modules = [];

    // setup default modules
    this.history = new History(this);
    this.commentify = new Commentify(this);
    this.indentify = new Indentify(this);
    this.breakify = new Breakify(this);
    this.removify = new Removify(this);
    this.pairify = new Pairify(this);
    this.tagify = new Tagify(this);

    // private properties
    this._keydownState = null;
    this._keydownEvent = (e) => {
      for (const m of this.modules) {
        m.onKeydown?.call(this, e);
      }

      if (e.defaultPrevented) {
        this._clearKeydownState();
      } else if (
        ![
          "Meta",
          "Control",
          "Alt",
          "Shift",
        ].includes(e.key)
      ) {
        this._setKeydownState(e);
      }
    }

    this._keyupEvent = (e) => {
      for (const m of this.modules) {
        m.onKeyup?.call(this, e);
      }
    }

    const _selectionEvent = (e: MouseEvent) => {
      this.history.add(false);
    }

    this._focusEvent = (e) => {
      setTimeout(() => {
        this.history.add(false);
        this.element.addEventListener("pointerup", _selectionEvent, true);
      }, 0);
    }

    this._blurEvent = (e) => {
      this.element.removeEventListener("pointerup", _selectionEvent, true);
    }

    this.element.addEventListener("keydown", this._keydownEvent, true);
    this.element.addEventListener("keyup", this._keyupEvent, true);
    this.element.addEventListener("focus", this._focusEvent, true);
    this.element.addEventListener("blur", this._blurEvent, true);
  }

  getState(withValue?: boolean) {
    return getState(this.element, withValue);
  }

  setState(state: IState) {
    setState(this.element, state);
  }

  _clearKeydownState() {
    this._keydownState = null;
  }

  _setKeydownState(e: KeyboardEvent) {
    this._keydownState = {
      value: this.element.value,
      state: getState(this.element),
      key: e.key,
    }
  }
}