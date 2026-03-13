import type { MTGA } from "../index.js";
export declare class MTGAModule {
    parent: MTGA;
    name: string;
    index: number;
    onKeydown?: (event: KeyboardEvent) => void | Promise<void>;
    onKeyup?: (event: KeyboardEvent) => void | Promise<void>;
    onPaste?: (event: ClipboardEvent) => void | Promise<void>;
    constructor(parent: MTGA, name: string, index?: number);
    static defaults: {};
}
//# sourceMappingURL=module.d.ts.map