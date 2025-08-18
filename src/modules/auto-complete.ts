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

type CompareResult = ReturnType<typeof compareString> & {
  tag: ITag,
  parts: IParts,
  from: string,
  to: string,
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
  candidates: ITag[];
  result: CompareResult[];

  parser: (el: HTMLTextAreaElement) => IParts;
  filter: (result: CompareResult, index: number, candidates: ITag[], stop: () => void) => boolean;
  onLoad: ((result: CompareResult[]) => void) | null;

  _reqId: number;
  _state: IState;
  _parts: IParts;

  constructor(el: HTMLTextAreaElement) {
    this.element = el;
    this.tags = [];
    this.index = {};
    this.candidates = [];
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
    this.onLoad = null;

    this._state = getState(el, true);
    this._parts = { head: "", body: "", tail: "" };
    this._reqId = 0;
  }

  createIndex(size = 1) {
    this.index = createIndex(this.tags, size);
  }

  reset() {
    setState(this.element, this._state);
  }

  set(result: CompareResult) {
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

  exec() {
    const reqId = this._reqId + 1;
    const result: CompareResult[] = [];

    const prevText = this._parts.body;
    const prevCandidates = this.candidates;

    const parts = this.parser(this.element);
    const text = parts.body;

    
    const candidates = !text
      ? []
      : prevText && text.indexOf(prevText) > -1
      ? prevCandidates
      : findIndex(this.index, text) || this.tags;

    // if (prevText && text.indexOf(prevText) > -1) {
    //   console.log("use prev candidates");
    // }

    this.result = result;
    this.candidates = candidates;
    this._parts = parts;
    this._state = getState(this.element, true);
    this._reqId = reqId;

    let isStopped = false,
        isKilled = false,
        i = 0;

    const stop = (kill?: boolean) => {
      isStopped = true;
      isKilled = kill || false;
    };

    const processChunk = () => {
      if (this._reqId !== reqId) {
        return;
      }

      if (isKilled) {
        return;
      }

      if (isStopped) {
        this.onLoad?.(result);
        return;
      }

      let max = i + 39;
      while(true) {
        if (i >= candidates.length) {
          isStopped = true;
          setTimeout(processChunk, 0);
          return;
        }

        if (i >= max) {
          setTimeout(processChunk, 0);
          return;
        }

        const tag = candidates[i];

        const res: CompareResult = {
          ...compareString(text, tag.key),
          tag,
          parts,
          from: text,
          to: tag.key,
        }

        const ok = this.filter(res, i, candidates, stop);
        if (ok) {
          result.push(res);
        }

        i++;
      }
    }

    processChunk();
  }
}