import { MTGA } from "../mtga.js";
import { MTGAModule } from "../types/module.js";
export declare class LinePasteModule extends MTGAModule {
    constructor(parent: MTGA);
    onPaste: (this: LinePasteModule, e: ClipboardEvent) => void;
    static name: string;
    static defaults: {};
}
//# sourceMappingURL=line-paste.d.ts.map