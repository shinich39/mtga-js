import { MTGA } from "../mtga.js";
import { IModule } from "../types/module.js";
export declare class LineBreakModule extends IModule {
    constructor(parent: MTGA);
    onKeydown: (this: LineBreakModule, e: KeyboardEvent) => void;
    static name: string;
    static defaults: {};
}
//# sourceMappingURL=line-break.d.ts.map