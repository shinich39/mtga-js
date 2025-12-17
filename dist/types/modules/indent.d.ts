import { MTGA } from "../mtga.js";
import { MTGAModule } from "../types/module.js";
declare const onKeydown: (this: IndentModule, e: KeyboardEvent) => void;
export declare class IndentModule extends MTGAModule {
    pattern: RegExp;
    value: string;
    constructor(parent: MTGA);
    onKeydown: typeof onKeydown;
    static name: string;
    static defaults: {
        pattern: RegExp;
        value: string;
    };
}
export {};
//# sourceMappingURL=indent.d.ts.map