import { MTGA } from "../mtga.js";
import { IModule } from "../types/module.js";
export declare class LineCutModule extends IModule {
    constructor(parent: MTGA);
    onKeydownAsync: (this: LineCutModule, e: KeyboardEvent) => Promise<void>;
    static name: string;
    static defaults: {};
}
//# sourceMappingURL=line-cut.d.ts.map