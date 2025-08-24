import { MTGA } from "../mtga.js";
import { MTGAModule } from "../types/module.js";
export declare class LineCutModule extends MTGAModule {
    constructor(parent: MTGA);
    onKeydownAsync: (this: LineCutModule, e: KeyboardEvent) => Promise<void>;
    static name: string;
    static defaults: {};
}
//# sourceMappingURL=line-cut.d.ts.map