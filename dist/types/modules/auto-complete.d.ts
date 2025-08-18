import { IState } from "./utils.js";
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
interface IRequest {
    tag: ITag;
    parts: IParts;
    [key: string]: any;
}
export declare class AutoComplete {
    element: HTMLTextAreaElement;
    tags: ITag[];
    index: Record<string, ITag[]>;
    timeout: number;
    result: IRequest[];
    parser: (el: HTMLTextAreaElement, stop: () => void) => IParts;
    filter: (req: IRequest, index: number, candidates: ITag[], stop: () => void) => boolean;
    onData: (chunks: IRequest[]) => void;
    onEnd: (result: IRequest[]) => void;
    _reqId: number;
    _chunkSize: number;
    _state: IState;
    constructor(el: HTMLTextAreaElement);
    findIndex(value: string): ITag[] | undefined;
    createIndex(size: number): Promise<Record<string, ITag[]>>;
    compare(a: string, b: string): {
        accuracy: number;
        score: number;
        match: [0 | 1 | -1, string][];
    };
    reset(): void;
    set(result: IRequest): void;
    exec(): void;
}
export {};
//# sourceMappingURL=auto-complete.d.ts.map