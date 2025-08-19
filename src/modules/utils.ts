import { IRow } from "../types/row.js";
import { IState } from "../types/state.js";

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

export const getState = function(
  el: HTMLTextAreaElement,
  withValue?: boolean,
): IState {
  const isReversed = el.selectionStart > el.selectionEnd;
  const short = Math.min(el.selectionStart, el.selectionEnd);
  const long = Math.max(el.selectionStart, el.selectionEnd);
  const dir = el.selectionDirection;

  if (withValue) {
    return {
      isReversed,
      short,
      long,
      dir,
      value: el.value,
    }
  }

  return {
    isReversed,
    short,
    long,
    dir,
  }
}

export const setState = function(
  el: HTMLTextAreaElement,
  state: IState,
) {
  if (state.value) {
    el.value = state.value;
  }
  if (!state.isReversed) {
    el.setSelectionRange(state.short, state.long, state.dir || "none");
  } else {
    el.setSelectionRange(state.long, state.short, state.dir || "none");
  }
  el.focus();
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
/**
 * analyze diff between two strings
 *
 * \-1: Number of deleted characters
 *
 * 0: Number of matched characters
 *
 * 1: Number of inserted characters
 */
export function compareString(from: string, to: string) {
  // create a dynamic programming table
  const dp: number[][] = Array.from({ length: from.length + 1 }, () =>
    Array(to.length + 1).fill(0)
  );

  // fill dp with LCS
  for (let i = 1; i <= from.length; i++) {
    for (let j = 1; j <= to.length; j++) {
      if (from[i - 1] === to[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // backtrack to get diffs
  const result: [-1 | 0 | 1, string][] = [];
  let score = 0;
  let i = from.length,
    j = to.length;

  let currentType: -1 | 0 | 1 | null = null;
  let buffer: string[] = [];

  const flush = function() {
    if (currentType !== null && buffer.length > 0) {
      result.push([currentType, buffer.reverse().join("")]);
    }
    currentType = null;
    buffer = [];
  }

  while (i > 0 || j > 0) {
    const a = from[i - 1];
    const b = to[j - 1];

    if (i > 0 && j > 0 && a === b) {
      // match
      if (currentType !== 0) {
        flush();
      }
      currentType = 0;
      buffer.push(a);
      score++;
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      // insertion
      if (currentType !== 1) {
        flush();
      }
      currentType = 1;
      buffer.push(b);
      j--;
    } else if (i > 0) {
      // deletion
      if (currentType !== -1) {
        flush();
      }
      currentType = -1;
      buffer.push(a);
      i--;
    }
  }

  flush();

  return {
    accuracy: score * 2 / (from.length + to.length),
    score,
    match: result.reverse(),
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

export const getRows = function(el: HTMLTextAreaElement) {
  const { short, long } = getState(el);
  // const isRange = short !== long;
  const arr = el.value.split(/\n/);

  const rows: IRow[] = [];
  const selectedRows: IRow[] = [];

  let offset = 0;
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];

    const isLastRow = i === arr.length - 1;
    const value = isLastRow ? item : item + "\n";

    const startIndex = offset;
    const endIndex = offset + item.length + 1;

    let selectionStart = -1,
        selectionEnd = -1,
        selectionValue = "";

    if (short >= startIndex && short < endIndex) {
      selectionStart = short - startIndex;
    }
    
    if (long > startIndex && long < endIndex) {
      selectionEnd = long - startIndex;
    }

    if (short <= startIndex && long >= endIndex) {
      selectionStart = 0;
      selectionEnd = value.length;
    }

    if (selectionStart > -1 && selectionEnd === -1) {
      selectionEnd = value.length;
    }

    if (selectionEnd > -1 && selectionStart === -1) {
      selectionStart = 0;
    }

    const isSelected = selectionStart > -1 && selectionEnd > -1;
    if (isSelected) {
      selectionValue = value.substring(selectionStart, selectionEnd);
    }

    const newRow = {
      rowIndex: i,
      startIndex,
      endIndex,
      value,
      selectionStart,
      selectionEnd,
      selectionValue,
    }

    rows.push(newRow);

    if (isSelected) {
      selectedRows.push(newRow);
    }

    offset = endIndex;
  }

  return {
    rows,
    selectedRows,
  };
}

export const updateRows = function(
  el: HTMLTextAreaElement,
  rows: IRow[],
  callback: (row: IRow, index: number, rows: IRow[]) => string,
) {
  const { short, long, dir, isReversed } = getState(el);

  let newShort = short,
      newLong = long;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const { startIndex, endIndex } = row;

    const origValue = row.value;
    const newValue = callback(row, i, rows);

    const diff = newValue.length - origValue.length;

    if (short >= startIndex && short < endIndex) {
      if (diff >= 0) {
        newShort += diff;
        newLong += diff;
      } else {
        newShort += Math.max(diff, startIndex - short);
        newLong += Math.max(diff, startIndex - long);
      }
    } else if (long >= startIndex && short < endIndex) {
      if (diff >= 0) {
        newLong += diff;
      } else {
        newLong += Math.max(diff, startIndex - long);
      }
    } else {
      newLong += diff;
    }

    row.value = newValue;
  }

  const values = rows.map((r) => r.value);

  return {
    isReversed,
    short: newShort,
    long: newLong,
    dir,
    value: values.join(""),
  } as IState;
}