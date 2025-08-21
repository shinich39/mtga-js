import { MTGA } from "../mtga.js";
import { IModule } from "../types/module.js";
import { IPairs } from "../types/pair.js";
export declare class AutoPairModule extends IModule {
    pairs: IPairs;
    constructor(parent: MTGA);
    onKeydown: (this: AutoPairModule, e: KeyboardEvent) => void;
    static name: string;
    static defaults: {
        pairs: IPairs;
    };
}
//# sourceMappingURL=auto-pair.d.ts.map