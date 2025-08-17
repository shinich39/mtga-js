type CallbackFunction = (...args: any[]) => any;
export declare class EventEmitter {
    _events: Record<string, CallbackFunction[]>;
    constructor();
    on(key: string, callback: CallbackFunction): void;
    emit(key: string, ...args: any[]): void;
}
export {};
//# sourceMappingURL=event.d.ts.map