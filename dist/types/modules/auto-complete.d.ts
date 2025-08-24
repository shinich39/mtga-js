import { MTGA } from "../mtga.js";
import { MTGAModule } from "../types/module.js";
interface IAutoCompleteTag {
    key: string;
    value: string;
    [key: string]: any;
}
interface IAutoCompleteQuery {
    head: string;
    body: string;
    tail: string;
}
interface IAutoCompleteChunk {
    tag: IAutoCompleteTag;
    query: IAutoCompleteQuery;
    [key: string]: any;
}
interface IAutoCompleteIndex {
    pattern: RegExp;
    tags: IAutoCompleteTag[];
}
export declare class AutoCompleteModule extends MTGAModule {
    tags: IAutoCompleteTag[];
    indexes: IAutoCompleteIndex[];
    parser: (this: this, el: HTMLTextAreaElement) => IAutoCompleteQuery;
    filter: (this: this, chunk: IAutoCompleteChunk, result: IAutoCompleteChunk[], index: number, candidates: IAutoCompleteTag[]) => boolean;
    onData: (this: this, chunks: IAutoCompleteChunk[], result: IAutoCompleteChunk[]) => void;
    onEnd: (this: this, result: IAutoCompleteChunk[]) => void;
    _requestId: number;
    _chunkSize: number;
    _stop: (kill?: boolean) => void;
    constructor(parent: MTGA);
    onKeyup: (this: AutoCompleteModule, e: KeyboardEvent) => void;
    static name: string;
    static defaults: {
        chunkSize: number;
        filter: AutoCompleteModule["filter"];
        parser: AutoCompleteModule["parser"];
    };
    compare(a: string, b: string): {
        accuracy: number;
        score: number;
        match: [0 | 1 | -1, string][];
    };
    stop(kill?: boolean): void;
    set(chunk: IAutoCompleteChunk): void;
}
export {};
//# sourceMappingURL=auto-complete.d.ts.map