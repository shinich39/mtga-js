import { MTGA } from "../mtga.js";
import { MTGAModule } from "../types/module.js";
import type { IPairs } from "../types/pair.js";
declare const onKeydown: (this: AutoIndentModule, e: KeyboardEvent) => void;
export declare class AutoIndentModule extends MTGAModule {
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
//# sourceMappingURL=auto-indent.d.ts.map