export declare class Commentify {
    element: HTMLTextAreaElement;
    key: string;
    removePattern: RegExp;
    newValue: string;
    constructor(el: HTMLTextAreaElement);
    isValid(e: KeyboardEvent): boolean;
    exec(e: KeyboardEvent): void;
}
//# sourceMappingURL=commentify.d.ts.map