export interface IState {
    short: number;
    long: number;
    isReversed?: boolean;
    dir?: "forward" | "backward" | "none";
    value?: string;
}
export interface IRow {
    rowIndex: number;
    startIndex: number;
    endIndex: number;
    value: string;
    selectionStart: number;
    selectionEnd: number;
    selectionValue: string;
}
/**
 * @example
 * input.addEventListener("input", debounce((e) => ..., 100));
 */
export declare function debounce(func: (...args: any[]) => any, delay: number): (...args: any[]) => void;
export declare const getState: (el: HTMLTextAreaElement, withValue?: boolean) => IState;
export declare const setState: (el: HTMLTextAreaElement, state: IState) => void;
export declare const parseKeyboardEvent: (e: KeyboardEvent) => {
    key: string;
    altKey: boolean;
    shiftKey: boolean;
    ctrlKey: boolean;
};
/**
 * analyze diff between two strings
 *
 * \-1: Number of deleted characters
 *
 * 0: Number of matched characters
 *
 * 1: Number of inserted characters
 */
export declare function compareString(from: string, to: string): {
    accuracy: number;
    score: number;
    match: [0 | 1 | -1, string][];
};
export declare function getAllCombinations<T>(arr: T[]): T[][];
export declare const getRows: (el: HTMLTextAreaElement) => {
    rows: IRow[];
    selectedRows: IRow[];
};
export declare const updateRows: (el: HTMLTextAreaElement, rows: IRow[], callback: (row: IRow) => string) => IState;
//# sourceMappingURL=utils.d.ts.map