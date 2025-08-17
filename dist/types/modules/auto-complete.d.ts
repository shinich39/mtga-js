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
type Result = ReturnType<typeof compareString> & {
    tag: ITag;
    parts: IParts;
};
export declare class AutoComplete {
    element: HTMLTextAreaElement;
    tags: ITag[];
    index: Record<string, ITag[]>;
    result: Result[];
    parser: (el: HTMLTextAreaElement) => IParts;
    filter: (result: Result, index: number, candidates: ITag[], stop: () => void) => boolean;
    onLoad: ((result: Result[]) => void) | null;
    _state: IState;
    _stop: ((preventCallback?: boolean) => void) | null;
    constructor(el: HTMLTextAreaElement);
    stop(preventCallback?: boolean): void;
    clear(): void;
    createIndex(size?: number): void;
    reset(): void;
    set(result: Result): void;
    exec(): Promise<void>;
}
export {};
//# sourceMappingURL=auto-complete.d.ts.map