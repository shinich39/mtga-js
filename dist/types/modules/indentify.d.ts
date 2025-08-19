import { MTGA } from "../mtga.js";
declare module "../mtga.js" {
    interface MTGA {
        indentify: Indentify;
    }
}
export declare class Indentify {
    parent: MTGA;
    pattern: RegExp;
    value: string;
    constructor(parent: MTGA);
    static defaults: {
        pattern: RegExp;
        value: string;
    };
}
//# sourceMappingURL=indentify.d.ts.map