import { MTGA } from "../mtga.js";
export declare class IModule {
    parent: MTGA;
    name: string;
    index: number;
    onKeydown?: (this: MTGA, event: KeyboardEvent) => void;
    onKeyup?: (this: MTGA, event: KeyboardEvent) => void;
    constructor(parent: MTGA, name: string, index?: number);
    static defaults: {};
}
//# sourceMappingURL=module.d.ts.map