import { IModule } from "./types/module.js";
import { getState, IKeydownState, IState, setState } from "./types/state.js";

import { HistoryModule } from "./modules/history.js";
import { CommentModule } from "./modules/comment.js";
import { IndentModule } from "./modules/indent.js";
import { AutoIndentModule } from "./modules/auto-indent.js";
import { AutoPairModule } from "./modules/auto-pair.js";
import { AutoCompleteModule } from "./modules/auto-complete.js";
import { LineBreakModule } from "./modules/line-break.js";
import { LineRemoveModule } from "./modules/line-remove.js";
import { LineCutModule } from "./modules/line-cut.js";
import { LineCopyModule } from "./modules/line-copy.js";
import { LinePasteModule } from "./modules/line-paste.js";

export { HistoryModule } from "./modules/history.js";
export { CommentModule } from "./modules/comment.js";
export { IndentModule } from "./modules/indent.js";
export { AutoIndentModule } from "./modules/auto-indent.js";
export { AutoCompleteModule } from "./modules/auto-complete.js";
export { AutoPairModule } from "./modules/auto-pair.js";
export { LineBreakModule } from "./modules/line-break.js";
export { LineRemoveModule } from "./modules/line-remove.js";
export { LineCutModule } from "./modules/line-cut.js";
export { LineCopyModule } from "./modules/line-copy.js";
export { LinePasteModule } from "./modules/line-paste.js";

export class MTGA {
  element: HTMLTextAreaElement;

  modules: Record<string, IModule>;
  moduleOrder: IModule[];

  _keydownState: IKeydownState | null;
  _keydownEvent: (e: KeyboardEvent) => void;
  _keyupEvent: (e: KeyboardEvent) => void;
  _pasteEvent: (e: ClipboardEvent) => void;
  _focusEvent: (e: FocusEvent) => void;
  _blurEvent: (e: FocusEvent) => void;
  
  constructor(el: HTMLTextAreaElement) {
    this.element = el;

    // setup default modules
    this.modules = {};
    this.modules[HistoryModule.name] = new HistoryModule(this);
    this.modules[CommentModule.name] = new CommentModule(this);
    this.modules[IndentModule.name] = new IndentModule(this);
    this.modules[LineBreakModule.name] = new LineBreakModule(this);
    this.modules[LineRemoveModule.name] = new LineRemoveModule(this);
    this.modules[LineCutModule.name] = new LineCutModule(this);
    this.modules[LineCopyModule.name] = new LineCopyModule(this);
    this.modules[LinePasteModule.name] = new LinePasteModule(this);
    this.modules[AutoIndentModule.name] = new AutoIndentModule(this);
    this.modules[AutoPairModule.name] = new AutoPairModule(this);
    this.modules[AutoCompleteModule.name] = new AutoCompleteModule(this);

    this.moduleOrder = [];

    // private properties
    this._keydownState = null;

    this._keydownEvent = async (e) => {
      for (const m of this.moduleOrder) {
        m.onKeydown?.call(m, e);
        await m.onKeydownAsync?.call(m, e);
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

    this._keyupEvent = async (e) => {
      for (const m of this.moduleOrder) {
        m.onKeyup?.call(m, e);
        await m.onKeyupAsync?.call(m, e);
      }
    }

    this._pasteEvent = async (e) => {
      for (const m of this.moduleOrder) {
        m.onPaste?.call(m, e);
        await m.onPasteAsync?.call(m, e);
      }
    }

    const _selectionEvent = (e: MouseEvent) => {
      this.addHistory(false);
    }

    this._focusEvent = (e) => {
      setTimeout(() => {
        this.addHistory(false);
        this.element.addEventListener("pointerup", _selectionEvent, true);
      }, 0);
    }

    this._blurEvent = (e) => {
      this.element.removeEventListener("pointerup", _selectionEvent, true);
    }

    this.element.addEventListener("keydown", this._keydownEvent, true);
    this.element.addEventListener("keyup", this._keyupEvent, true);
    this.element.addEventListener("paste", this._pasteEvent, true);

    this.element.addEventListener("focus", this._focusEvent, true);
    this.element.addEventListener("blur", this._blurEvent, true);


    this.initModuleOrder();
  }

  initModuleOrder() {
    this.moduleOrder = Object.values(this.modules).sort((a, b) => a.index - b.index);
  }

  getModule<T extends IModule>(name: string) {
    return this.modules[name] as T | undefined;
  }

  setModule<T extends IModule>(module: T) {
    this.modules[module.name] = module;
    this.initModuleOrder();
  }

  removeModule(name: string) {
    if (this.modules[name]) {
      delete this.modules[name];
      this.initModuleOrder();
    }
  }

  getState(withValue?: boolean) {
    return getState(this.element, withValue);
  }

  setState(state: IState) {
    setState(this.element, state);
  }

  addHistory(withPrune = true) {
    this.getModule<HistoryModule>(HistoryModule.name)?.add(withPrune);
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

  destroy() {
    this.element.removeEventListener("keydown", this._keydownEvent);
    this.element.removeEventListener("keyup", this._keyupEvent);
    this.element.removeEventListener("paste", this._pasteEvent);
    this.element.removeEventListener("focus", this._focusEvent);
    this.element.removeEventListener("blur", this._blurEvent);
  }
}