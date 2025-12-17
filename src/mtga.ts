import { MTGAModule } from "./types/module.js";
import { getState, setState } from "./types/state.js";
import type { IKeydownState, IState } from "./types/state.js";

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

export { MTGAModule } from "./types/module.js";
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

const MTGAMap = new WeakMap<HTMLTextAreaElement, MTGA>();

export class MTGA {
  element: HTMLTextAreaElement;

  modules: Record<string, MTGAModule>;
  moduleOrder: MTGAModule[];

  _keydownState: IKeydownState | null;
  _keydownEvent: (e: KeyboardEvent) => void;
  _keyupEvent: (e: KeyboardEvent) => void;
  _pasteEvent: (e: ClipboardEvent) => void;
  _focusEvent: (e: FocusEvent) => void;
  _blurEvent: (e: FocusEvent) => void;

  static getMTGA(el: HTMLTextAreaElement) : MTGA | undefined {
    return MTGAMap.get(el);
  }

  static defaults: {
    eventListenerOptions: AddEventListenerOptions,
  } = {
    eventListenerOptions: {
      capture: true,
      once: false,
      passive: false,
    }
  }

  constructor(el: HTMLTextAreaElement) {
    const exists = MTGA.getMTGA(el);

    if (exists) {
      console.warn("Already initialized");
      this.element = exists.element;
      this.modules = exists.modules;
      this.moduleOrder = exists.moduleOrder;
      this._keydownState = exists._keydownState;
      this._keydownEvent = exists._keydownEvent;
      this._keyupEvent = exists._keyupEvent;
      this._pasteEvent = exists._pasteEvent;
      this._focusEvent = exists._focusEvent;
      this._blurEvent = exists._blurEvent;
      return;
    }

    this.element = el;

    // setup default modules
    this.moduleOrder = [];
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

    // private properties
    this._keydownState = null;

    this._keydownEvent = async (e) => {
      for (const m of this.moduleOrder) {
        m.onKeydown?.call(m, e);
        await m.onKeydownAsync?.call(m, e);
      }

      if (e.defaultPrevented) {
        this._removeKeydownState();
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
        this.element.addEventListener("pointerup", _selectionEvent, MTGA.defaults.eventListenerOptions);
      }, 0);
    }

    this._blurEvent = (e) => {
      this.element.removeEventListener("pointerup", _selectionEvent, MTGA.defaults.eventListenerOptions);
    }

    this.setEvents();
    this.setModuleOrder();

    MTGAMap.set(el, this);
  }

  setEvents(): void {
    this.element.addEventListener("keydown", this._keydownEvent, MTGA.defaults.eventListenerOptions);
    this.element.addEventListener("keyup", this._keyupEvent, MTGA.defaults.eventListenerOptions);
    this.element.addEventListener("paste", this._pasteEvent, MTGA.defaults.eventListenerOptions);
    this.element.addEventListener("focus", this._focusEvent, MTGA.defaults.eventListenerOptions);
    this.element.addEventListener("blur", this._blurEvent, MTGA.defaults.eventListenerOptions);
  }

  removeEvents(): void {
    this.element.removeEventListener("keydown", this._keydownEvent);
    this.element.removeEventListener("keyup", this._keyupEvent);
    this.element.removeEventListener("paste", this._pasteEvent);
    this.element.removeEventListener("focus", this._focusEvent);
    this.element.removeEventListener("blur", this._blurEvent);
  }

  setModuleOrder(): void {
    this.moduleOrder = Object.values(this.modules).sort((a, b) => a.index - b.index);
  }

  getModule<T extends MTGAModule>(name: string): T | undefined {
    return this.modules[name] as T | undefined;
  }

  setModule<T extends MTGAModule>(module: T): void {
    this.modules[module.name] = module;
    this.setModuleOrder();
  }

  removeModule(name: string): void {
    if (this.modules[name]) {
      delete this.modules[name];
      this.setModuleOrder();
    }
  }

  getState(withValue?: boolean): IState {
    return getState(this.element, withValue);
  }

  setState(state: IState, beforeHistory = true, afterHistory = true): void {
    if (beforeHistory) {
      this.addHistory();
    }

    setState(this.element, state);

    if (afterHistory) {
      this.addHistory();
    }
  }

  addHistory(withPrune = true): void {
    this.getModule<HistoryModule>(HistoryModule.name)?.add(withPrune);
  }

  removeHistory(): void {
    this.getModule<HistoryModule>(HistoryModule.name)?.remove();
  }

  _setKeydownState(e: KeyboardEvent): void {
    this._keydownState = {
      value: this.element.value,
      state: getState(this.element),
      key: e.key,
    }
  }

  _removeKeydownState(): void {
    this._keydownState = null;
  }
}