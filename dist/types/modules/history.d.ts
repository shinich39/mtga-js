import { MTGA } from "../mtga.js";
import { MTGAModule } from "../types/module.js";
import type { IState } from "../types/state.js";
declare const onKeydown: (this: HistoryModule, e: KeyboardEvent) => void;
export declare class HistoryModule extends MTGAModule {
    items: IState[];
    maxCount: number;
    _i: number;
    constructor(parent: MTGA);
    static name: string;
    static defaults: {
        maxCount: number;
    };
    onKeydown: typeof onKeydown;
    onKeyup: typeof onKeydown;
    prune(): void;
    add(withPrune?: boolean): void;
    remove(): void;
    prev(): IState | undefined;
    next(): IState | undefined;
    curr(): IState | undefined;
}
export {};
//# sourceMappingURL=history.d.ts.map