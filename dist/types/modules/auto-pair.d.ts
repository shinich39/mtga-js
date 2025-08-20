import { MTGA } from "../mtga.js";
import { IModule } from "../types/module.js";
interface IPairs {
    [key: string]: string;
}
export declare class AutoPairModule extends IModule {
    pairs: IPairs;
    constructor(parent: MTGA);
    onKeydown: (this: MTGA, e: KeyboardEvent) => void;
    static name: string;
    static defaults: {
        pairs: IPairs;
    };
}
export {};
//# sourceMappingURL=auto-pair.d.ts.map