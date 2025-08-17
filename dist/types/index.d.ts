import { AutoPairing } from "./modules/auto-pairing.js";
import { IState } from "./modules/utils.js";
import { History } from "./modules/history.js";
import { Commentify } from "./modules/commentify.js";
import { Indentify } from "./modules/indentify.js";
import { AutoComplete } from "./modules/auto-complete.js";
interface KeydownState {
    state: IState;
    value: string;
    key: string;
}
export declare class MTGA {
    element: HTMLTextAreaElement;
    _keydownState: KeydownState | null;
    History: History;
    Commentify: Commentify;
    Indentify: Indentify;
    AutoPairing: AutoPairing;
    AutoComplete: AutoComplete;
    constructor(el: HTMLTextAreaElement);
    getState(withValue?: boolean): IState;
    setState(state: IState): void;
    getCaretPosition(): {
        top: number;
        left: number;
    };
    _clearKeydownState(): void;
    _setKeydownState(e: KeyboardEvent): void;
}
export {};
//# sourceMappingURL=index.d.ts.map