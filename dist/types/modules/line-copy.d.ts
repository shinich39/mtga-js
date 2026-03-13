import type { MTGA } from "../index.js";
import { MTGAModule } from "../types/module.js";
declare const onKeydown: (this: LineCopyModule, e: KeyboardEvent) => Promise<void>;
export declare class LineCopyModule extends MTGAModule {
    constructor(parent: MTGA);
    onKeydown: typeof onKeydown;
    static name: string;
    static defaults: {};
}
export {};
//# sourceMappingURL=line-copy.d.ts.map