import { getState } from "./state.js";

export interface IRow {
  isSelected: boolean,
  index: number,
  startIndex: number,
  endIndex: number,
  value: string,
  selectionStart: number,
  selectionEnd: number,
  // selectionValue: string,
}

export const getRows = function(el: HTMLTextAreaElement) {
  const { short, long } = getState(el);
  // const isRange = short !== long;
  const arr = el.value.split(/\n/);

  const rows: IRow[] = [];

  let offset = 0;
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];

    const isLastRow = i === arr.length - 1;
    const value = isLastRow ? item : item + "\n";

    const startIndex = offset;
    const endIndex = startIndex + value.length;

    let selectionStart = -1,
        selectionEnd = -1,
        selectionValue = "";

    if (short >= startIndex && short < endIndex) {
      selectionStart = short - startIndex;
    }
    
    if (
      long > startIndex && 
      (!isLastRow ? long < endIndex : long <= endIndex)
    ) {
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
    }

    rows.push(newRow);

    offset = endIndex;
  }

  return rows;
}