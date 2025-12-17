import { MTGA } from "../mtga.js";
import { MTGAModule } from "../types/module.js";
import type { IPairs } from "../types/pair.js";
declare const onKeydown: (this: LineBreakModule, e: KeyboardEvent) => void;
export declare class LineBreakModule extends MTGAModule {
    pairs: IPairs;
    indentUnit: string;
    constructor(parent: MTGA);
    onKeydown: typeof onKeydown;
    static name: string;
    static defaults: {
        pairs: IPairs;
        indentUnit: string;
    };
}
export {};
//# sourceMappingURL=line-break.d.ts.map