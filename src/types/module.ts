import { MTGA } from "../mtga.js";

export class IModule {
  parent: MTGA;
  name: string;
  index: number;
  onKeydown?: (event: KeyboardEvent) => void;
  onKeyup?: (event: KeyboardEvent) => void;

  constructor(parent: MTGA, name: string, index = 9999) {
    this.parent = parent;
    this.name = name;
    this.index = index;
  }

  static defaults = {};
}