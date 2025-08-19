import { MTGA } from "../mtga.js";
declare module "../mtga.js" {
    interface MTGA {
        breakify: Breakify;
    }
}
export declare class Breakify {
    parent: MTGA;
    constructor(parent: MTGA);
    static defaults: {};
}
//# sourceMappingURL=breakify.d.ts.map