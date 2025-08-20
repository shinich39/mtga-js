import { MTGA } from "../mtga.js";
import { compareString, parseKeyboardEvent, setState } from "./utils.js";

declare module "../mtga.js" {
  interface MTGA {
    tagify: Tagify,
  }
}

interface ITagifyTag {
  key: string;
  value: string;
  [key: string]: any;
}

interface ITagifyQuery {
  head: string,
  body: string,
  tail: string,
}

interface ITagifyChunk {
  tag: ITagifyTag,
  query: ITagifyQuery,
  [key: string]: any;
}

interface ITagifyIndex {
  pattern: RegExp,
  tags: ITagifyTag[],
}

const findIndex = function(indexes: ITagifyIndex[], value: string) {
  for (const index of indexes) {
    const pattern = index.pattern;
    if (pattern.test(value)) {
      return index;
    }
  }
}

const onKeydown = function(this: MTGA, e: KeyboardEvent) {
  if (e.defaultPrevented) {
    return;
  }
  
  const { key, altKey, ctrlKey, shiftKey } = parseKeyboardEvent(e);

  const isValid = !ctrlKey && (key.length === 1 || key === "Backspace");
  if (!isValid) {
    return;
  }

  const tagify = this.tagify;

  tagify.stop(true);
  
  const requestId = tagify._requestId + 1;
  const chunkSize = tagify._chunkSize;
  const result: ITagifyChunk[] = [];

  let isStopped = false,
      isKilled = false,
      i = 0;

  const stop = (kill?: boolean) => {
    isStopped = true;
    isKilled = kill || false;
  };

  tagify._requestId = requestId;
  tagify._stop = stop;

  const query = tagify.parser.call(this, this.element);
  const text = query.body;
  
  let candidates: ITagifyTag[] = [];

  if (text) {
    const index = findIndex(tagify.indexes, text);
    if (index) {
      candidates = index.tags;

      // debug
      // console.log(`Use Index:`, index);
    } else {
      candidates = tagify.tags;
    }
  }

  // debug
  // console.time("" + requestId);

  const processChunk = () => {
    const chunks: ITagifyChunk[] = [];

    let j = i + chunkSize;
    while(i < j && i < candidates.length) {
      const tag = candidates[i];

      const chunk = {
        tag,
        query,
      }

      const ok = tagify.filter?.call(this, chunk, i, candidates, result);
      if (ok) {
        chunks.push(chunk);
        result.push(chunk);
      }

      i++;
    }

    if (isKilled || tagify._requestId !== requestId) {
      return;
    }

    if (isStopped || i >= candidates.length) {
      // debug
      // console.timeEnd("" + requestId);
      tagify.onData?.call(this, chunks, result);
      tagify.onEnd?.call(this, result);
      return;
    }
    
    tagify.onData?.call(this, chunks, result);
    setTimeout(processChunk, 0);
  }

  processChunk();
}

export class Tagify {
  parent: MTGA;
  tags: ITagifyTag[];
  indexes: ITagifyIndex[];

  parser: (this: MTGA, el: HTMLTextAreaElement) => ITagifyQuery;
  filter: (this: MTGA, chunk: ITagifyChunk, index: number, candidates: ITagifyTag[], result: ITagifyChunk[]) => boolean;
  onData: (this: MTGA, chunks: ITagifyChunk[], result: ITagifyChunk[]) => void;
  onEnd: (this: MTGA, result: ITagifyChunk[]) => void;

  _requestId: number;
  _chunkSize: number;
  _stop: (kill?: boolean) => void;

  constructor(parent: MTGA) {
    this.parent = parent;
    this.tags = [];
    this.indexes = [];

    this.parser = Tagify.defaults.parser;
    this.filter = Tagify.defaults.filter;
    this.onData = () => undefined;
    this.onEnd = () => undefined;

    this._requestId = 0;
    this._chunkSize = Tagify.defaults.chunkSize;
    this._stop = () => undefined;

    parent.modules.push(
      {
        name: "tagify",
        onKeyup: onKeydown,
      }
    );
  }

  static defaults: {
    chunkSize: number,
    filter: Tagify["filter"],
    parser: Tagify["parser"],
  } = {
    chunkSize: 100,

    parser: (el: HTMLTextAreaElement) => {
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

    filter: () => true,
  }

  compare(a: string, b: string) {
    return compareString(a, b);
  }

  stop(kill?: boolean) {
    const stop = this._stop;
    stop?.(kill);
  }

  set(chunk: ITagifyChunk) {
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

    setState(this.parent.element, state);
  }
}