import { compareString, getAllCombinations } from "./utils.js";

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
  result: CompareResult[];

  parser: (el: HTMLTextAreaElement) => IParts;
  filter: (result: CompareResult, index: number, candidates: ITag[]) => boolean;
  onLoad: ((result: CompareResult[]) => void) | null;
  _stop: ((preventCallback?: boolean) => void) | null;

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
      const body = el.value.substring(selectionStart, selectionEnd).trim().replace(/\s/g, "_");
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
    this._stop?.(preventCallback);
    this._stop = null;
  }

  createIndex(size = 1) {
    this.index = createIndex(this.tags, size);
  }

  execSync() {
    this.stop(true);

    let isStopped = false,
        preventCallback = false;

    this._stop = (prevent) => {
      isStopped = true;
      preventCallback = prevent || false;
    };

    const result: CompareResult[] = [];
    const parts = this.parser(this.element);
    const text = parts.body;
    
    this.result = result;

    const candidates = !text
      ? []
      : findIndex(this.index, text) || this.tags;

    for (let i = 0; i < candidates.length; i++) {
      const tag = candidates[i];

      const res: CompareResult = {
        ...compareString(text, tag.key),
        tag,
        parts,
      }

      const ok = this.filter 
        ? this.filter(res, i, candidates) 
        : true;

      if (ok) {
        result.push(res);
      }

      if (isStopped) {
        break;
      }
    }

    if (!preventCallback) {
      this.onLoad?.(result);
    }

    return result;
  }

  async exec() {
    return this.execSync();
  }
}