import { AutoPairing } from "./modules/auto-pairing.js";
import { getState, getCaretPosition, IState, setState } from "./modules/utils.js";
import { History, isRedo, isUndo } from "./modules/history.js";
import { Commentify } from "./modules/commentify.js";
import { Indentify } from "./modules/indentify.js";
import { AutoComplete } from "./modules/auto-complete.js";

interface KeydownState {
  state: IState,
  value: string,
  key: string,
}

export class MTGA {
  element: HTMLTextAreaElement;
  _keydownState: KeydownState | null;

  History: History;
  Commentify: Commentify;
  Indentify: Indentify;
  AutoPairing: AutoPairing;
  AutoComplete: AutoComplete;
  
  constructor(el: HTMLTextAreaElement) {
    this.element = el;
    this._keydownState = null;

    this.History = new History(el);
    this.Commentify = new Commentify(el);
    this.Indentify = new Indentify(el);
    this.AutoPairing = new AutoPairing(el, {
      "(": ")",
      "[": "]",
      "{": "}",
      "<": ">",
      "'": "'",
      "\"": "\"",
      "`": "`",
    });
    this.AutoComplete = new AutoComplete(el);

    el.addEventListener("keydown", (e) => {
      if (isUndo(e)) {
        // console.log("undo");
        e.preventDefault();
        this.History.undo(e);
        this._clearKeydownState();
      } else if (isRedo(e)) {
        // console.log("redo");
        e.preventDefault();
        this.History.redo(e);
        this._clearKeydownState();
      } else if (this.AutoPairing.isInsert(e)) {
        // console.log("insertPair");
        e.preventDefault();
        this.AutoPairing.insert(e);
        this.History.add();
        this._clearKeydownState();
      } else if (this.AutoPairing.isDelete(e)) {
        // console.log("deletePair");
        e.preventDefault();
        this.AutoPairing.delete(e);
        this.History.add();
        this._clearKeydownState();
      } else if (this.Commentify.isValid(e)) {
        // console.log("commentify");
        e.preventDefault();
        this.Commentify.exec(e);
        this.History.add();
        this._clearKeydownState();
      } else if (this.Indentify.isValid(e)) {
        // console.log("indentify");
        e.preventDefault();
        this.Indentify.exec(e);
        this.History.add();
        this._clearKeydownState();
      } else if (
        ![
          // "Backspace",
          "Meta",
          "Control",
          "Alt",
          "Shift",
        ].includes(e.key)
      ) {
        // console.log("keydown", e.key);
        this._setKeydownState(e);
      }
    });

    el.addEventListener("keyup", (e) => {
      const keydownState = this._keydownState;
      
      this._clearKeydownState();

      if (!keydownState) {
        return;
      }

      const prevValue = keydownState.value;

      // insert
      if (prevValue !== el.value) {
        this.History.add();

        // auto-complete
        this.AutoComplete.exec();
      } // move
      else {
        const prevState = keydownState.state;
        const currState = getState(el);
        if (
          prevState.short !== currState.short ||
          prevState.long !== currState.long
        ) {
          this.History.add(false);
        }
      }
    });

    this.element.addEventListener("mouseup", (e) => {
      this.History.add(false);
    });
  }

  getState(withValue?: boolean) {
    return getState(this.element, withValue);
  }

  setState(state: IState) {
    setState(this.element, state);
  }

  getCaretPosition() {
    return getCaretPosition(this.element);
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