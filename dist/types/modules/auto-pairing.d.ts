export interface IPairs {
    [key: string]: string;
}
export declare class AutoPairing {
    element: HTMLTextAreaElement;
    pairs: IPairs;
    constructor(el: HTMLTextAreaElement, pairs: IPairs);
    isInsert(e: KeyboardEvent): boolean;
    isDelete(e: KeyboardEvent): boolean;
    insert(e: KeyboardEvent): void;
    delete(e: KeyboardEvent): void;
}
//# sourceMappingURL=auto-pairing.d.ts.map