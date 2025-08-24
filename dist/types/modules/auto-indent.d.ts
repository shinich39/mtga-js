import { MTGA } from "../mtga.js";
import { MTGAModule } from "../types/module.js";
import { IPairs } from "../types/pair.js";
export declare class AutoIndentModule extends MTGAModule {
    pairs: IPairs;
    indentUnit: string;
    constructor(parent: MTGA);
    onKeydown: (this: AutoIndentModule, e: KeyboardEvent) => void;
    static name: string;
    static defaults: {
        pairs: IPairs;
        indentUnit: string;
    };
}
//# sourceMappingURL=auto-indent.d.ts.map