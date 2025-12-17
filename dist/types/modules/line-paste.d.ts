import { MTGA } from "../mtga.js";
import { MTGAModule } from "../types/module.js";
declare const onPaste: (this: LinePasteModule, e: ClipboardEvent) => void;
export declare class LinePasteModule extends MTGAModule {
    constructor(parent: MTGA);
    onPaste: typeof onPaste;
    static name: string;
    static defaults: {};
}
export {};
//# sourceMappingURL=line-paste.d.ts.map