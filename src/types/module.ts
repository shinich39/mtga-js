import { MTGA } from "../mtga.js";

export class IModule {
  parent: MTGA;
  name: string;
  index: number;
  onKeydown?: (this: MTGA, event: KeyboardEvent) => void;
  onKeyup?: (this: MTGA, event: KeyboardEvent) => void;

  constructor(parent: MTGA, name: string, index = 9999) {
    this.parent = parent;
    this.name = name;
    this.index = index;
  }

  static defaults = {};
}