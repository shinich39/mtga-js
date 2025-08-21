import { MTGA } from "../mtga.js";
import { IModule } from "../types/module.js";
export declare class CommentModule extends IModule {
    pattern: RegExp;
    value: string;
    constructor(parent: MTGA);
    static name: string;
    static defaults: {
        pattern: RegExp;
        value: string;
    };
    onKeydown: (this: CommentModule, e: KeyboardEvent) => void;
}
//# sourceMappingURL=comment.d.ts.map