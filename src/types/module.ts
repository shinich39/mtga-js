import type { MTGA } from "../index.js";

export class MTGAModule {
  parent: MTGA;
  name: string;
  index: number;
  onKeydown?: (event: KeyboardEvent) => void | Promise<void>;
  onKeyup?: (event: KeyboardEvent) => void | Promise<void>;
  onPaste?: (event: ClipboardEvent) => void | Promise<void>;

  constructor(parent: MTGA, name: string, index = 9999) {
    this.parent = parent;
    this.name = name;
    this.index = index;
  }

  static defaults = {};
}
