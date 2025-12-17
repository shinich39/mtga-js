import { MTGA } from "../mtga.js";
import { MTGAModule } from "../types/module.js";
import { parseKeyboardEvent } from "./utils.js";

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

interface IAutoCompleteIndex {
  pattern: string | RegExp,
  tags: IAutoCompleteTag[],
}

const onKeyup = function(this: AutoCompleteModule, e: KeyboardEvent): void {
  if (e.defaultPrevented) {
    return;
  }
  
  const { key, altKey, ctrlKey, shiftKey } = parseKeyboardEvent(e);

  const isValid = !ctrlKey && !altKey && (key.length === 1 || key === "Backspace");
  if (!isValid) {
    return;
  }

  // kill previous process
  this.kill();
  
  // const mtga = this.parent;
  // const el = this.parent.element;

  const chunkSize = this.chunkSize;

  let isStopped = false,
      isKilled = false,
      i = 0;

  const stop = (kill?: boolean) => {
    isStopped = true;
    isKilled = kill || false;
  };

  this._stop = stop;

  const query = this.parser.call(this, e);
  const text = query?.body;

  if (!text) {
    this.query = null;
    this.candidates = [];
    this.result = [];
    return;
  }

  const candidates: IAutoCompleteTag[] = this.getIndex(text)?.tags || this.tags;
  const result: IAutoCompleteTag[] = [];
  
  this.query = query;
  this.candidates = candidates;
  this.result = result;

  // debug
  // console.time("AutoComplete");

  const processChunk = () => {
    const chunks: IAutoCompleteTag[] = [];

    let j = i + chunkSize;
    while(i < j && i < candidates.length) {
      const tag = candidates[i];

      if (isKilled || isStopped) {
        break;
      }

      const ok = this.filter?.call(this, query, tag, i, candidates);

      if (ok) {
        chunks.push(tag);
        result.push(tag);
      }

      i++;
    }

    // debug
    // console.log(`Process ${i}`);

    if (isKilled) {
      // debug
      // console.log("Killed");
      return;
    }

    if (isStopped || i >= candidates.length) {
      // debug
      // console.timeEnd("AutoComplete");
      // console.log("Stopped");
      this.onData?.call(this, chunks);
      this.onEnd?.call(this);
      return;
    }
    
    this.onData?.call(this, chunks);

    setTimeout(processChunk, 0);
  }

  processChunk();
}

export class AutoCompleteModule extends MTGAModule {
  tags: IAutoCompleteTag[];
  indexes: IAutoCompleteIndex[];
  chunkSize: number;

  query: IAutoCompleteQuery | null | undefined;
  candidates: IAutoCompleteTag[];
  result: IAutoCompleteTag[];

  parser: (this: this, event: KeyboardEvent) => IAutoCompleteQuery | null | undefined;
  filter: (this: this, query: IAutoCompleteQuery, tag: IAutoCompleteTag, index: number, tags: IAutoCompleteTag[]) => boolean;
  
  onData: (this: this, tags: IAutoCompleteTag[]) => void;
  onEnd: (this: this) => void;

  _stop: (kill?: boolean) => void;

  constructor(parent: MTGA) {
    super(parent, AutoCompleteModule.name, 1);
    this.tags = [];
    this.indexes = [];
    this.chunkSize = AutoCompleteModule.defaults.chunkSize;
    this.query = null;
    this.candidates = [];
    this.result = [];

    this.parser = AutoCompleteModule.defaults.parser;
    this.filter = AutoCompleteModule.defaults.filter;
    this.onData = () => undefined;
    this.onEnd = () => undefined;

    this._stop = () => undefined;
  }

  onKeyup: typeof onKeyup = onKeyup;

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

    filter: function (query, tag, index, tags) {
      const a = query.body;
      const b = tag.key;

      // if (this.result.length >= 100) {
      //   this.stop(true);
      //   return false;
      // }

      return b.indexOf(a) > -1;
    },
  }

  getIndex(value: string): IAutoCompleteIndex | undefined {
    return this.indexes.find((i) => 
      typeof i.pattern === "string"
        ? i.pattern === value
        : i.pattern.test(value));
  }

  stop(): void {
    const stop = this._stop;
    stop?.(false);
  }

  kill(): void {
    const stop = this._stop;
    stop?.(true);
  }

  set(tag: IAutoCompleteTag, query?: IAutoCompleteQuery | undefined | null): void {
    const mtga = this.parent;
    
    if (!query) {
      query = this.query;
    }

    if (!query) {
      throw new Error("Query not found");
    }

    const short = query.head.length + tag.value.length;
    const long = query.head.length + tag.value.length;
    const value = query.head + tag.value + query.tail;

    mtga.setState({
      short,
      long,
      value,
    });
  }
}