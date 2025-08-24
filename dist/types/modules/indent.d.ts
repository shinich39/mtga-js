import { MTGA } from "../mtga.js";
import { MTGAModule } from "../types/module.js";
export declare class IndentModule extends MTGAModule {
    pattern: RegExp;
    value: string;
    constructor(parent: MTGA);
    onKeydown: (this: IndentModule, e: KeyboardEvent) => void;
    static name: string;
    static defaults: {
        pattern: RegExp;
        value: string;
    };
}
//# sourceMappingURL=indent.d.ts.map