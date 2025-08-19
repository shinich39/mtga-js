import { MTGA } from "../mtga.js";
declare module "../mtga.js" {
    interface MTGA {
        pairify: Pairify;
    }
}
interface IPairs {
    [key: string]: string;
}
export declare class Pairify {
    parent: MTGA;
    pairs: IPairs;
    constructor(parent: MTGA);
    static defaults: {
        pairs: IPairs;
    };
}
export {};
//# sourceMappingURL=pairify.d.ts.map