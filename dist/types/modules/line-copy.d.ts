import { MTGA } from "../mtga.js";
import { MTGAModule } from "../types/module.js";
export declare class LineCopyModule extends MTGAModule {
    constructor(parent: MTGA);
    onKeydownAsync: (this: LineCopyModule, e: KeyboardEvent) => Promise<void>;
    static name: string;
    static defaults: {};
}
//# sourceMappingURL=line-copy.d.ts.map