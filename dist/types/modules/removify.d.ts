import { MTGA } from "../mtga.js";
declare module "../mtga.js" {
    interface MTGA {
        removify: Removify;
    }
}
export declare class Removify {
    parent: MTGA;
    constructor(parent: MTGA);
    static defaults: {};
}
//# sourceMappingURL=removify.d.ts.map