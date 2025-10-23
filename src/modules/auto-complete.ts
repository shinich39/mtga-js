import { MTGA } from "../mtga.js";
import { MTGAModule } from "../types/module.js";
import { compareString, parseKeyboardEvent } from "./utils.js";

interface IAutoCompleteTag {
  key: string;
  value: string;
  [key: string]: any;
}

interface IAutoCompleteQuery {
  head: string,
  body: string,
  tail: string,
}

interface IAutoCompleteChunk {
  tag: IAutoCompleteTag,
  query: IAutoCompleteQuery,
  [key: string]: any;
}

interface IAutoCompleteIndex {
  pattern: RegExp,
  tags: IAutoCompleteTag[],
}

const findIndex = function(indexes: IAutoCompleteIndex[], value: string) {
  for (const index of indexes) {
    const pattern = index.pattern;
    if (pattern.test(value)) {
      return index;
    }
  }
}

const onKeyup = function(this: AutoCompleteModule, e: KeyboardEvent) {
  if (e.defaultPrevented) {
    return;
  }
  
  const { key, altKey, ctrlKey, shiftKey } = parseKeyboardEvent(e);

  const isValid = !ctrlKey && !altKey && (key.length === 1 || key === "Backspace");
  if (!isValid) {
    return;
  }

  this.stop(true);
  
  // const mtga = this.parent;
  // const el = this.parent.element;

  const requestId = this._requestId + 1;
  const chunkSize = this._chunkSize;
  const result: IAutoCompleteChunk[] = [];

  let isStopped = false,
      isKilled = false,
      i = 0;

  const stop = (kill?: boolean) => {
    isStopped = true;
    isKilled = kill || false;
  };

  this._requestId = requestId;
  this._stop = stop;

  const query = this.parser.call(this, e);
  const text = query.body;
  
  let candidates: IAutoCompleteTag[] = [];

  if (text) {
    const index = findIndex(this.indexes, text);
    if (index) {
      candidates = index.tags;

      // debug
      // console.log(`Use Index:`, index);
    } else {
      candidates = this.tags;
    }
  }
  
  // debug
  // console.time("" + requestId);

  const processChunk = () => {
    const chunks: IAutoCompleteChunk[] = [];

    let j = i + chunkSize;
    while(i < j && i < candidates.length) {
      const tag = candidates[i];

      const chunk = {
        tag,
        query,
      }

      const ok = this.filter?.call(this, chunk, result, i, candidates);
      if (ok) {
        chunks.push(chunk);
        result.push(chunk);
      }

      i++;
    }

    if (isKilled || this._requestId !== requestId) {
      return;
    }

    if (isStopped || i >= candidates.length) {
      // debug
      // console.timeEnd("" + requestId);
      this.onData?.call(this, chunks, result);
      this.onEnd?.call(this, result);
      return;
    }
    
    this.onData?.call(this, chunks, result);
    setTimeout(processChunk, 0);
  }

  processChunk();
}

export class AutoCompleteModule extends MTGAModule {
  tags: IAutoCompleteTag[];
  indexes: IAutoCompleteIndex[];

  parser: (this: this, event: KeyboardEvent) => IAutoCompleteQuery;
  filter: (this: this, chunk: IAutoCompleteChunk, result: IAutoCompleteChunk[], index: number, candidates: IAutoCompleteTag[]) => boolean;
  onData: (this: this, chunks: IAutoCompleteChunk[], result: IAutoCompleteChunk[]) => void;
  onEnd: (this: this, result: IAutoCompleteChunk[]) => void;

  _requestId: number;
  _chunkSize: number;
  _stop: (kill?: boolean) => void;

  constructor(parent: MTGA) {
    super(parent, AutoCompleteModule.name, 1);
    
    this.tags = [];
    this.indexes = [];

    this.parser = AutoCompleteModule.defaults.parser;
    this.filter = AutoCompleteModule.defaults.filter;
    this.onData = () => undefined;
    this.onEnd = () => undefined;

    this._requestId = 0;
    this._chunkSize = AutoCompleteModule.defaults.chunkSize;
    this._stop = () => undefined;
  }

  onKeyup = onKeyup;

  static name = "AutoComplete";
  
  static defaults: {
    chunkSize: number,
    filter: AutoCompleteModule["filter"],
    parser: AutoCompleteModule["parser"],
  } = {
    chunkSize: 100,

    parser: function (e: Event) {
      const el = e.target as HTMLTextAreaElement;
      const parts = el.value.split(/[,.․‧・｡。{}()<>[\]\\/|'"`!?]|\r\n|\r|\n/);
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

      let head = el.value.substring(0, selectionStart),
          body = el.value.substring(selectionStart, selectionEnd),
          tail = el.value.substring(selectionEnd);

      // re-format selection value for seaching
      const match = body.match(/^(\s*)(.*?)(\s*)$/);

      if (match) {
        head = head + (match[1] || "");
        body = match[2];
        tail = (match[3] || "") + tail;
      }

      return {
        head,
        body,
        tail,
      }
    },

    filter: function (chunk, index, candidates, result) {
      const { tag, query } = chunk;
      const a = query.body;
      const b = tag.key;

      // if (result.length >= 100) {
      //   this.getModule<AutoCompleteModule>(AutoCompleteModule.name)?.stop(true);
      //   return false;
      // }

      return b.indexOf(a) > -1;
    },
  }

  compare(a: string, b: string) {
    return compareString(a, b);
  }

  stop(kill?: boolean) {
    const stop = this._stop;
    stop?.(kill);
  }

  set(chunk: IAutoCompleteChunk) {
    // const short = chunk.query.head.length;
    const short = chunk.query.head.length 
      + chunk.tag.value.length;

    const long = chunk.query.head.length 
      + chunk.tag.value.length;

    const value = chunk.query.head 
      + chunk.tag.value 
      + chunk.query.tail;

    const state = {
      short,
      long,
      value,
    }

    const mtga = this.parent;

    mtga.setState(state);
  }
}