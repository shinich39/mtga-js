import { MTGA } from "../mtga.js";
export interface IModule {
    name: string;
    onKeydown?: (this: MTGA, event: KeyboardEvent) => void;
    onKeyup?: (this: MTGA, event: KeyboardEvent) => void;
}
//# sourceMappingURL=module.d.ts.map