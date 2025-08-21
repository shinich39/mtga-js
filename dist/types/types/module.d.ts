import { MTGA } from "../mtga.js";
export declare class IModule {
    parent: MTGA;
    name: string;
    index: number;
    onKeydown?: (event: KeyboardEvent) => void;
    onKeyup?: (event: KeyboardEvent) => void;
    constructor(parent: MTGA, name: string, index?: number);
    static defaults: {};
}
//# sourceMappingURL=module.d.ts.map