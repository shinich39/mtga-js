import { MTGA } from "../mtga.js";
import { MTGAModule } from "../types/module.js";
declare const onKeydown: (this: CommentModule, e: KeyboardEvent) => void;
export declare class CommentModule extends MTGAModule {
    pattern: RegExp;
    value: string;
    constructor(parent: MTGA);
    static name: string;
    static defaults: {
        pattern: RegExp;
        value: string;
    };
    onKeydown: typeof onKeydown;
}
export {};
//# sourceMappingURL=comment.d.ts.map