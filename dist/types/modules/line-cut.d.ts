import type { MTGA } from "../index.js";
import { MTGAModule } from "../types/module.js";
declare const onKeydown: (this: LineCutModule, e: KeyboardEvent) => Promise<void>;
export declare class LineCutModule extends MTGAModule {
    constructor(parent: MTGA);
    onKeydown: typeof onKeydown;
    static name: string;
    static defaults: {};
}
export {};
//# sourceMappingURL=line-cut.d.ts.map