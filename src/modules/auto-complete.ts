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
};

export class AutoComplete {
  element: HTMLTextAreaElement;
  tags: ITag[];
  index: Record<string, ITag[]>;
  result: CompareResult[];

  parser: (el: HTMLTextAreaElement, stop: () => void) => IParts;
  filter: (result: CompareResult, index: number, candidates: ITag[], stop: () => void) => boolean;
  onLoad: ((result: CompareResult[]) => void) | null;

  _reqId: number;
  _state: IState;

  constructor(el: HTMLTextAreaElement) {
    this.element = el;
    this.tags = [];
    this.index = {};
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
      const body = el.value.substring(selectionStart, selectionEnd).trim();
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
    this._reqId = 0;
  }

  findIndex(value: string) {
    const index = this.index;

    const keys = Object.keys(index)
      .sort((a, b) => b.length - a.length);
      
    for (const k of keys) {
      const { score } = compareString(k, value);
      if (score === k.length) {
        return index[k];
      }
    }
  }

  createIndex(size: number) {
    const tags = this.tags;
    const result: Record<string, ITag[]> = {};
    
    this.index = result;

    return new Promise<typeof result>((resolve) => {
      let i = 0;

      const processChunk = () => {
        let j = i + 100;
        while(i < tags.length) {
          if (i >= j) {
            setTimeout(processChunk, 0);
            return;
          }

          const tag = tags[i];
          const acc: string[] = [];
          const combos = getAllCombinations(tag.key.split(""));
          
          for (const c of combos) {
            if (c.length <= size) {
              const v = c.join("");
              if (v) {
                acc.push(v);
              }
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

          i++;
        }

        resolve(result);
      }

      processChunk();
    });
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

    let isStopped = false,
        isKilled = false,
        i = 0;

    const stop = (kill?: boolean) => {
      isStopped = true;
      isKilled = kill || false;
    };

    const parts = this.parser(this.element, stop);
    const text = parts.body;

    const candidates = !text
      ? []
      : this.findIndex(text) || this.tags;

    this.result = result;
    this._state = getState(this.element, true);
    this._reqId = reqId;

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

      let j = i + 100;
      while(i < candidates.length) {
        if (i >= j) {
          setTimeout(processChunk, 0);
          return;
        }

        const tag = candidates[i];

        const res: CompareResult = {
          ...compareString(text, tag.key),
          tag,
          parts,
        }

        const ok = this.filter(res, i, candidates, stop);
        if (ok) {
          result.push(res);
        }

        i++;
      }

      isStopped = true;
      setTimeout(processChunk, 0);
    }

    processChunk();
  }
}