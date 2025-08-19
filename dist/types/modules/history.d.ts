import { MTGA } from "../mtga.js";
import { IState } from "../types/state.js";
declare module "../mtga.js" {
    interface MTGA {
        history: History;
    }
}
export declare class History {
    parent: MTGA;
    items: IState[];
    index: number;
    maxCount: number;
    constructor(parent: MTGA);
    static defaults: {
        maxCount: number;
    };
    prune(): void;
    add(withPrune?: boolean): void;
    prev(): IState;
    next(): IState;
    curr(): IState;
}
//# sourceMappingURL=history.d.ts.map