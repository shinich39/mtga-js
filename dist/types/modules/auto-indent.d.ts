import type { MTGA } from "../index.js";
import { MTGAModule } from "../types/module.js";
import type { IPairs } from "../types/pair.js";
declare const onKeydown: (this: AutoIndentModule, e: KeyboardEvent) => void;
export declare class AutoIndentModule extends MTGAModule {
    pairs: IPairs;
    indentUnit: string;
    constructor(parent: MTGA);
    static name: string;
    static defaults: {
        pairs: IPairs;
        indentUnit: string;
    };
    onKeydown: typeof onKeydown;
}
export {};
//# sourceMappingURL=auto-indent.d.ts.map