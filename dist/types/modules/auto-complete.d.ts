import { compareString, IState } from "./utils.js";
interface ITag {
    key: string;
    value: string;
    [key: string]: any;
}
interface IParts {
    head: string;
    body: string;
    tail: string;
}
type CompareResult = ReturnType<typeof compareString> & {
    tag: ITag;
    parts: IParts;
    from: string;
    to: string;
};
export declare class AutoComplete {
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
    constructor(el: HTMLTextAreaElement);
    createIndex(size?: number): void;
    reset(): void;
    set(result: CompareResult): void;
    exec(): void;
}
export {};
//# sourceMappingURL=auto-complete.d.ts.map