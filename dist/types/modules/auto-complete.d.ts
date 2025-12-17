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
interface IAutoCompleteIndex {
    pattern: string | RegExp;
    tags: IAutoCompleteTag[];
}
declare const onKeyup: (this: AutoCompleteModule, e: KeyboardEvent) => void;
export declare class AutoCompleteModule extends MTGAModule {
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
    constructor(parent: MTGA);
    onKeyup: typeof onKeyup;
    static name: string;
    static defaults: {
        chunkSize: number;
        filter: AutoCompleteModule["filter"];
        parser: AutoCompleteModule["parser"];
    };
    getIndex(value: string): IAutoCompleteIndex | undefined;
    stop(): void;
    kill(): void;
    set(tag: IAutoCompleteTag, query?: IAutoCompleteQuery | undefined | null): void;
}
export {};
//# sourceMappingURL=auto-complete.d.ts.map