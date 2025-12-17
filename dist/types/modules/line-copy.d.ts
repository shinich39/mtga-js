import { MTGA } from "../mtga.js";
import { MTGAModule } from "../types/module.js";
declare const onKeydownAsync: (this: LineCopyModule, e: KeyboardEvent) => Promise<void>;
export declare class LineCopyModule extends MTGAModule {
    constructor(parent: MTGA);
    onKeydownAsync: typeof onKeydownAsync;
    static name: string;
    static defaults: {};
}
export {};
//# sourceMappingURL=line-copy.d.ts.map