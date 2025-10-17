import { MTGA } from "../mtga.js";
import { MTGAModule } from "../types/module.js";
import { IState } from "../types/state.js";
export declare class HistoryModule extends MTGAModule {
    items: IState[];
    maxCount: number;
    _i: number;
    constructor(parent: MTGA);
    static name: string;
    static defaults: {
        maxCount: number;
    };
    onKeydown: (this: HistoryModule, e: KeyboardEvent) => void;
    onKeyup: (this: HistoryModule, e: KeyboardEvent) => void;
    prune(): void;
    add(withPrune?: boolean): void;
    remove(): void;
    prev(): IState;
    next(): IState;
    curr(): IState;
}
//# sourceMappingURL=history.d.ts.map