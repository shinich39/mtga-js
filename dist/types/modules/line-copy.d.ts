import { MTGA } from "../mtga.js";
import { IModule } from "../types/module.js";
export declare class LineCopyModule extends IModule {
    constructor(parent: MTGA);
    onKeydown: (this: LineCopyModule, e: KeyboardEvent) => void;
    static name: string;
    static defaults: {};
}
//# sourceMappingURL=line-copy.d.ts.map