import { MTGA } from "../mtga.js";
import { MTGAModule } from "../types/module.js";
export declare class LineBreakModule extends MTGAModule {
    constructor(parent: MTGA);
    onKeydown: (this: LineBreakModule, e: KeyboardEvent) => void;
    static name: string;
    static defaults: {};
}
//# sourceMappingURL=line-break.d.ts.map