import { MTGA } from "../mtga.js";
import { MTGAModule } from "../types/module.js";
export declare class LineRemoveModule extends MTGAModule {
    constructor(parent: MTGA);
    onKeydown: (this: LineRemoveModule, e: KeyboardEvent) => void;
    static name: string;
    static defaults: {};
}
//# sourceMappingURL=line-remove.d.ts.map