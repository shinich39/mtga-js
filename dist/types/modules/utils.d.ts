import { IPairs } from "../types/pair.js";
/**
 * @example
 * input.addEventListener("input", debounce((e) => ..., 100));
 */
export declare function debounce(func: (...args: any[]) => any, delay: number): (...args: any[]) => void;
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
/**
 *
 * @param pairs
 * @param indentUnit
 * @param rows value.substring(0, selectionStart).split(/\r\n|\r|\n/)
 * @returns
 */
export declare function getIndent(pairs: IPairs, indentUnit: string, rows: string[]): string;
//# sourceMappingURL=utils.d.ts.map