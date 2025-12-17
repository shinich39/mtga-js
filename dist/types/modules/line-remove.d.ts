import { MTGA } from "../mtga.js";
import { MTGAModule } from "../types/module.js";
declare const onKeydown: (this: LineRemoveModule, e: KeyboardEvent) => void;
export declare class LineRemoveModule extends MTGAModule {
    constructor(parent: MTGA);
    onKeydown: typeof onKeydown;
    static name: string;
    static defaults: {};
}
export {};
//# sourceMappingURL=line-remove.d.ts.map