import type { IPairs } from "../types/pair.js";
export declare const isOpening: (pairs: IPairs, value: string) => boolean;
export declare const isClosing: (pairs: IPairs, value: string) => boolean;
export declare const isPair: (pairs: IPairs, opening: string, closing: string) => boolean;
export declare const getOpening: (pairs: IPairs, value: string) => string | undefined;
export declare const getClosing: (pairs: IPairs, value: string) => string;
/**
 * @param pairs
 * @param indentUnit
 * @param rows value.substring(0, selectionStart).split(/\r\n|\r|\n/)
 */
export declare function getIndent(pairs: IPairs, indentUnit: string, rows: string[]): string;
//# sourceMappingURL=pair.d.ts.map