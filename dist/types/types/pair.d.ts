export interface IPairs {
    [key: string]: string;
}
export declare const isOpening: (pairs: IPairs, value: string) => boolean;
export declare const isClosing: (pairs: IPairs, value: string) => boolean;
export declare const isPair: (pairs: IPairs, opening: string, closing: string) => boolean;
export declare const getOpening: (pairs: IPairs, value: string) => string | undefined;
export declare const getClosing: (pairs: IPairs, value: string) => string;
//# sourceMappingURL=pair.d.ts.map