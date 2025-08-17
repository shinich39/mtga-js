export declare class Indentify {
    element: HTMLTextAreaElement;
    key: string;
    removePattern: RegExp;
    newValue: string;
    constructor(el: HTMLTextAreaElement);
    isValid(e: KeyboardEvent): boolean;
    exec(e: KeyboardEvent): void;
}
//# sourceMappingURL=indentify.d.ts.map