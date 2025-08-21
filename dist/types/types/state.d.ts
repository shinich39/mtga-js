export interface IState {
    short: number;
    long: number;
    isReversed?: boolean;
    dir?: "forward" | "backward" | "none";
    value?: string;
}
export interface IKeydownState {
    state: IState;
    value: string;
    key: string;
}
export declare const getState: (el: HTMLTextAreaElement, withValue?: boolean) => IState;
export declare const setState: (el: HTMLTextAreaElement, state: IState) => void;
//# sourceMappingURL=state.d.ts.map