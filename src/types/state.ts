export interface IState {
  short: number,
  long: number,
  isReversed?: boolean,
  dir?: "forward" | "backward" | "none",
  value?: string,
}

export interface IKeydownState {
  state: IState,
  value: string,
  key: string,
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
  if (typeof state.value === "string") {
    el.value = state.value;
  }
  if (!state.isReversed) {
    el.setSelectionRange(state.short, state.long, state.dir || "none");
  } else {
    el.setSelectionRange(state.long, state.short, state.dir || "none");
  }
  el.focus();
}