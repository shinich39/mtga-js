import { MTGA } from "../mtga.js";
declare module "../mtga.js" {
    interface MTGA {
        tagify: Tagify;
    }
}
interface ITagifyTag {
    key: string;
    value: string;
    [key: string]: any;
}
interface ITagifyQuery {
    head: string;
    body: string;
    tail: string;
}
interface ITagifyChunk {
    tag: ITagifyTag;
    query: ITagifyQuery;
    [key: string]: any;
}
interface ITagifyIndex {
    pattern: RegExp;
    tags: ITagifyTag[];
}
export declare class Tagify {
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
    constructor(parent: MTGA);
    static defaults: {
        chunkSize: number;
        filter: Tagify["filter"];
        parser: Tagify["parser"];
    };
    compare(a: string, b: string): {
        accuracy: number;
        score: number;
        match: [0 | 1 | -1, string][];
    };
    stop(kill?: boolean): void;
    set(chunk: ITagifyChunk): void;
}
export {};
//# sourceMappingURL=tagify.d.ts.map