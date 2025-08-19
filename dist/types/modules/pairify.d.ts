import { MTGA } from "../mtga.js";
declare module "../mtga.js" {
    interface MTGA {
        pairify: Pairify;
    }
}
export interface IPairs {
    [key: string]: string;
}
export declare class Pairify {
    parent: MTGA;
    pairs: IPairs;
    constructor(parent: MTGA);
    static defaults: {
        pairs: {
            "(": string;
            "[": string;
            "{": string;
            "<": string;
            "'": string;
            "\"": string;
            "`": string;
        };
    };
}
//# sourceMappingURL=pairify.d.ts.map