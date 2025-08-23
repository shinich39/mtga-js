import { MTGA } from "../mtga.js";
import { IModule } from "../types/module.js";
export declare class LinePasteModule extends IModule {
    constructor(parent: MTGA);
    onPaste: (this: LinePasteModule, e: ClipboardEvent) => void;
    static name: string;
    static defaults: {};
}
//# sourceMappingURL=line-paste.d.ts.map