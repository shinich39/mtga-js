import type { IPairs } from "../types/pair.js";
/**
 * @example
 * input.addEventListener("input", debounce((e) => ..., 100));
 */
export declare function debounce(func: (...args: any[]) => any, delay: number): () => void;
export declare function escapePattern(str: string): string;
export declare const parseKeyboardEvent: (e: KeyboardEvent) => {
    key: string;
    altKey: boolean;
    shiftKey: boolean;
    ctrlKey: boolean;
};
export declare function getAllCombinations<T>(arr: T[]): T[][];
/**
 * @param pairs
 * @param indentUnit
 * @param rows value.substring(0, selectionStart).split(/\r\n|\r|\n/)
 */
export declare function getIndent(pairs: IPairs, indentUnit: string, rows: string[]): string;
//# sourceMappingURL=utils.d.ts.map