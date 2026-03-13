import type { IPairs } from "../types/pair.js";

export const isOpening = (pairs: IPairs, value: string): boolean =>
  Object.keys(pairs).includes(value);

export const isClosing = (pairs: IPairs, value: string): boolean =>
  Object.values(pairs).includes(value);

export const isPair = (pairs: IPairs, opening: string, closing: string): boolean =>
  !!pairs[opening] && pairs[opening] === closing;

export const getOpening = (pairs: IPairs, value: string): string | undefined =>
  Object.entries(pairs).find((entry) => entry[1] === value)?.[0];

export const getClosing = (pairs: IPairs, value: string): string => pairs[value];

/**
 * @param pairs
 * @param indentUnit
 * @param rows value.substring(0, selectionStart).split(/\r\n|\r|\n/)
 */
export function getIndent(pairs: IPairs, indentUnit: string, rows: string[]): string {
  const createIndent = (unit: string, size: number) =>
    unit.repeat(Math.ceil(size / unit.length)).slice(0, size);

  const openingChars = Object.keys(pairs).join("");
  const closingChars = Object.values(pairs).join("");

  for (let i = rows.length - 1; i >= 0; i--) {
    const row = rows[i];
    for (let j = row.length - 1; j >= 0; j--) {
      const ch = row[j];

      if (closingChars.includes(ch)) {
        const depth = row.match(/^\s*/)?.[0].length || 0;
        return createIndent(indentUnit, depth);
      }

      if (openingChars.includes(ch)) {
        const depth = (row.match(/^\s*/)?.[0].length || 0) + indentUnit.length;
        return createIndent(indentUnit, depth);
      }
    }
  }

  return "";
}
