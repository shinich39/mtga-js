import { MTGA } from "../mtga.js";
import { IModule } from "../types/module.js";
export declare class IndentModule extends IModule {
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