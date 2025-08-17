import { IState } from "./utils.js";
export declare const isUndo: (e: KeyboardEvent) => boolean;
export declare const isRedo: (e: KeyboardEvent) => boolean;
export declare class History {
    element: HTMLTextAreaElement;
    histories: IState[];
    index: number;
    maxCount: number;
    constructor(el: HTMLTextAreaElement);
    prune(): void;
    add(prune?: boolean): void;
    prev(): void;
    next(): void;
    curr(): IState;
    undo(e: KeyboardEvent): void;
    redo(e: KeyboardEvent): void;
}
//# sourceMappingURL=history.d.ts.map