import { MTGA } from "../mtga.js";
import { MTGAModule } from "../types/module.js";
declare const onKeydownAsync: (this: LineCutModule, e: KeyboardEvent) => Promise<void>;
export declare class LineCutModule extends MTGAModule {
    constructor(parent: MTGA);
    onKeydownAsync: typeof onKeydownAsync;
    static name: string;
    static defaults: {};
}
export {};
//# sourceMappingURL=line-cut.d.ts.map