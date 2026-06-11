import type { IRow } from "../types/row.js";
import { getState } from "./state.js";

export const getRows = (el: HTMLTextAreaElement): IRow[] => {
  const { short, long } = getState(el);
  const arr: string[] = [];
  let startIndex = 0;

  for (const match of el.value.matchAll(/\r\n|\r|\n/g)) {
    const endIndex = match.index! + match[0].length;
    arr.push(el.value.substring(startIndex, endIndex));
    startIndex = endIndex;
  }

  arr.push(el.value.substring(startIndex));

  const rows: IRow[] = [];

  let offset = 0;
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];

    const isLastRow = i === arr.length - 1;
    const value = item;

    const startIndex = offset;
    const endIndex = startIndex + value.length;

    let selectionStart = -1,
      selectionEnd = -1,
      selectionValue = "";

    if (short >= startIndex && short < endIndex) {
      selectionStart = short - startIndex;
    }

    if (long > startIndex && (!isLastRow ? long < endIndex : long <= endIndex)) {
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
    // if (isSelected) {
    //   selectionValue = value.substring(selectionStart, selectionEnd);
    // }

    const newRow = {
      isSelected,
      index: i,
      startIndex,
      endIndex,
      value,
      selectionStart,
      selectionEnd,
      // selectionValue,
    };

    rows.push(newRow);

    offset = endIndex;
  }

  return rows;
};
