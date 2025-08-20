import { MTGA } from "../mtga.js";
import { IModule } from "../types/module.js";
export declare class LineRemoveModule extends IModule {
    constructor(parent: MTGA);
    onKeydown: (this: MTGA, e: KeyboardEvent) => void;
    static name: string;
    static defaults: {};
}
//# sourceMappingURL=line-remove.d.ts.map