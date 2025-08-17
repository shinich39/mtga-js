import { compareString, getAllCombinations, getState, IState, setState } from "./utils.js";

interface ITag {
  key: string;
  value: string;
  [key: string]: any;
}

interface IParts {
  head: string,
  body: string,
  tail: string,
}

type Result = ReturnType<typeof compareString> & {
  tag: ITag,
  parts: IParts,
};

const findIndex = function(
  index: Record<string, ITag[]>,
  value: string,
) {
  const keys = Object.keys(index).sort((a, b) => b.length - a.length);

  for (const k of keys) {
    const { score } = compareString(k, value);
    if (score === k.length) {
      return index[k];
    }
  }
}

const createIndex = function(
  tags: ITag[],
  maxIndexSize: number,
) {
  const result: Record<string, ITag[]> = {};

  if (maxIndexSize > 0) {
    for (const tag of tags) {
      const { key, value } = tag;
      const acc: string[] = [];
      const combos = getAllCombinations(key.split(""));
      
      for (const c of combos) {
        if (c.length <= maxIndexSize) {
          acc.push(c.join(""));
        }
      }

      const uniqCombos = [...new Set(acc)];

      for (const c of uniqCombos) {
        if (!result[c]) {
          result[c] = [tag];
        } else {
          result[c].push(tag);
        }
      }
    }
  }

  return result;
}

export class AutoComplete {
  element: HTMLTextAreaElement;
  tags: ITag[];
  index: Record<string, ITag[]>;
  result: Result[];

  parser: (el: HTMLTextAreaElement) => IParts;
  filter: (result: Result, index: number, candidates: ITag[], stop: () => void) => boolean;
  onLoad: ((result: Result[]) => void) | null;

  _state: IState;
  _stop: ((preventCallback?: boolean) => void) | null;

  constructor(el: HTMLTextAreaElement) {
    this.element = el;
    this.tags = [];
    this.index = {};
    this._state = getState(el, true);
    this.result = [];

    this.parser = (el) => {
      const parts = el.value.split(/[,.\s․‧・｡。{}()<>[\]\\/|'"`!?]/);
      const index = el.selectionStart;

      let selectionStart = 0,
          selectionEnd = 0;

      for (const part of parts) {
        selectionEnd = selectionStart + part.length;
        if (index >= selectionStart && index <= selectionEnd) {
          break;
        }
        selectionStart = selectionEnd + 1;
      }

      const head = el.value.substring(0, selectionStart);
      // re-format selection value for seaching
      const body = el.value.substring(selectionStart, selectionEnd)
        .trim()
        .replace(/\s/g, "_");
      const tail = el.value.substring(selectionEnd);

      return {
        head,
        body,
        tail,
      }
    }
    this.filter = () => true;
    this._stop = null;
    this.onLoad = null;
  }

  stop(preventCallback?: boolean) {
    const stop = this._stop;
    if (stop) {
      stop(preventCallback);
    }
  }

  clear() {
    const stop = this._stop;
    if (stop) {
      stop(true);
    }
    this.result = [];
  }

  createIndex(size = 1) {
    this.index = createIndex(this.tags, size);
  }

  reset() {
    setState(this.element, this._state);
  }

  set(result: Result) {
    // const short = res.parts.head.length;
    const short = result.parts.head.length + result.tag.value.length;
    const long = result.parts.head.length + result.tag.value.length;
    const value = result.parts.head 
      + result.tag.value 
      + result.parts.tail;

    const state = {
      short,
      long,
      value,
    }

    setState(this.element, state);
  }

  async exec() {
    this.clear();

    this._state = getState(this.element, true);

    let isStopped = false,
        isKilled = false;

    this._stop = (preventCallback) => {
      isStopped = true;
      isKilled = preventCallback || false;
      this._stop = null;
    };

    const stop = this._stop;
    const result = this.result;
    const parts = this.parser(this.element);
    const text = parts.body;
    const candidates = !text
      ? []
      : findIndex(this.index, text) || this.tags;

    for (let i = 0; i < candidates.length; i++) {
      const tag = candidates[i];

      const res: Result = {
        ...compareString(text, tag.key),
        tag,
        parts,
      }

      const ok = this.filter(res, i, candidates, stop);

      if (ok) {
        result.push(res);
      }

      if (isStopped) {
        break;
      }

      if (i % 39 === 0) {
        await new Promise((r) => setTimeout(r, 0));
      }
    }

    if (!isKilled) {
      this.onLoad?.(result);
    }
  }
}