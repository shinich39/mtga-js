import { compareString } from "./utils.js";
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
};
export declare class AutoComplete {
    element: HTMLTextAreaElement;
    tags: ITag[];
    index: Record<string, ITag[]>;
    result: CompareResult[];
    parser: (el: HTMLTextAreaElement) => IParts;
    filter: (result: CompareResult, index: number, candidates: ITag[]) => boolean;
    onLoad: ((result: CompareResult[]) => void) | null;
    _stop: ((preventCallback?: boolean) => void) | null;
    constructor(el: HTMLTextAreaElement);
    stop(preventCallback?: boolean): void;
    createIndex(size?: number): void;
    execSync(): CompareResult[];
    exec(): Promise<CompareResult[]>;
}
export {};
//# sourceMappingURL=auto-complete.d.ts.map