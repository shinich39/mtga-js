import type { MTGA } from "../index.js";
import { MTGAModule } from "../types/module.js";
import type { IPairs } from "../types/pair.js";
declare const onKeydown: (this: AutoPairModule, e: KeyboardEvent) => void;
export declare class AutoPairModule extends MTGAModule {
    pairs: IPairs;
    constructor(parent: MTGA);
    static name: string;
    static defaults: {
        pairs: IPairs;
    };
    onKeydown: typeof onKeydown;
}
export {};
//# sourceMappingURL=auto-pair.d.ts.map