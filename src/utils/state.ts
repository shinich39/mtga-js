import type { IState } from "../types/state.js";

export const getState = (el: HTMLTextAreaElement, withValue?: boolean): IState => {
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
    };
  }

  return {
    isReversed,
    short,
    long,
    dir,
  };
};

export const setState = (el: HTMLTextAreaElement, state: IState): void => {
  let isChanged = false;
  
  if (typeof state.value === "string") {
    if (el.value !== state.value) {
      el.value = state.value;
      isChanged = true;
    }
  }

  if (!state.isReversed) {
    el.setSelectionRange(state.short, state.long, state.dir);
  } else {
    el.setSelectionRange(state.long, state.short, state.dir);
  }

  el.focus();

  if (isChanged) {
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }
};
