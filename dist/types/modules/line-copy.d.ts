import { MTGA } from "../mtga.js";
import { IModule } from "../types/module.js";
export declare class LineCopyModule extends IModule {
    constructor(parent: MTGA);
    onKeydownAsync: (this: LineCopyModule, e: KeyboardEvent) => Promise<void>;
    static name: string;
    static defaults: {};
}
//# sourceMappingURL=line-copy.d.ts.map