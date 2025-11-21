import { IPairs } from "../types/pair.js";

/**
 * @example
 * input.addEventListener("input", debounce((e) => ..., 100));
 */
export function debounce(
  func: (...args: any[]) => any,
  delay: number
) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
}

export function escapePattern(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const parseKeyboardEvent = function(e: KeyboardEvent) {
  const key = e.key;
  const altKey = e.altKey;
  const shiftKey = e.shiftKey;
  const ctrlKey = e.ctrlKey || e.metaKey;

  return {
    key,
    altKey,
    shiftKey,
    ctrlKey,
  }
}

export function getAllCombinations<T>(arr: T[]) {
  const result: T[][] = [];
  const n = arr.length;
  for (let i = 1; i < (1 << n); i++) {
    const combo = [];
    for (let j = 0; j < n; j++) {
      if ((i >> j) & 1) {
        combo.push(arr[j]);
      }
    }
    result.push(combo);
  }
  return result;
}
/**
 * 
 * @param pairs 
 * @param indentUnit 
 * @param rows value.substring(0, selectionStart).split(/\r\n|\r|\n/)
 * @returns 
 */
export function getIndent(pairs: IPairs, indentUnit: string, rows: string[]) {

  const createIndent = function(unit: string, size: number) {
    return unit.repeat(Math.ceil(size / unit.length)).slice(0, size);
  }

  const openingChars = Object.keys(pairs).join("");
  const closingChars = Object.values(pairs).join("");

  for (let i = rows.length - 1; i >= 0; i--) {
    const row = rows[i];
    for (let j = row.length - 1; j >= 0; j--) {
      const ch = row[j];

      if (closingChars.includes(ch)) {
        const depth = (row.match(/^\s*/)?.[0].length || 0);
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