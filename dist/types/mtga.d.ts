import { MTGAModule } from "./types/module.js";
import type { IKeydownState, IState } from "./types/state.js";
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
export declare class MTGA {
    element: HTMLTextAreaElement;
    modules: Record<string, MTGAModule>;
    moduleOrder: MTGAModule[];
    _keydownState: IKeydownState | null;
    _keydownEvent: (e: KeyboardEvent) => void;
    _keyupEvent: (e: KeyboardEvent) => void;
    _pasteEvent: (e: ClipboardEvent) => void;
    _focusEvent: (e: FocusEvent) => void;
    _blurEvent: (e: FocusEvent) => void;
    static exists(el: HTMLTextAreaElement): boolean;
    static getMTGA(el: HTMLTextAreaElement): MTGA | undefined;
    static defaults: {
        eventListenerOptions: AddEventListenerOptions;
    };
    constructor(el: HTMLTextAreaElement);
    setEvents(): void;
    removeEvents(): void;
    setModuleOrder(): void;
    getModule<T extends MTGAModule>(name: string): T | undefined;
    setModule<T extends MTGAModule>(module: T): void;
    removeModule(name: string): void;
    getState(withValue?: boolean): IState;
    setState(state: IState, beforeHistory?: boolean, afterHistory?: boolean): void;
    addHistory(withPrune?: boolean): void;
    removeHistory(): void;
    _setKeydownState(e: KeyboardEvent): void;
    _removeKeydownState(): void;
}
//# sourceMappingURL=mtga.d.ts.map