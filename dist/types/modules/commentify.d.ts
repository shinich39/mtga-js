import { MTGA } from "../mtga.js";
declare module "../mtga.js" {
    interface MTGA {
        commentify: Commentify;
    }
}
export declare class Commentify {
    parent: MTGA;
    pattern: RegExp;
    value: string;
    constructor(parent: MTGA);
    static defaults: {
        pattern: RegExp;
        value: string;
    };
}
//# sourceMappingURL=commentify.d.ts.map