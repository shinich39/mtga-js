import "./modules/pairify.js";
import "./modules/commentify.js";
import "./modules/indentify.js";
import "./modules/tagify.js";
import { IModule } from "./types/module.js";
import { IKeydownState, IState } from "./types/state.js";
import "./modules/history.js";
import "./modules/breakify.js";
export { Pairify } from "./modules/pairify.js";
export { Breakify } from "./modules/breakify.js";
export { Commentify } from "./modules/commentify.js";
export { Indentify } from "./modules/indentify.js";
export { Tagify } from "./modules/tagify.js";
export { History } from "./modules/history.js";
export declare class MTGA {
    element: HTMLTextAreaElement;
    modules: IModule[];
    _keydownState: IKeydownState | null;
    _keydownEvent: (e: KeyboardEvent) => void;
    _keyupEvent: (e: KeyboardEvent) => void;
    _mouseupEvent: (e: MouseEvent) => void;
    constructor(el: HTMLTextAreaElement);
    getState(withValue?: boolean): IState;
    setState(state: IState): void;
    _clearKeydownState(): void;
    _setKeydownState(e: KeyboardEvent): void;
}
//# sourceMappingURL=mtga.d.ts.map