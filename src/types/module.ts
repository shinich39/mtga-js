import { MTGA } from "../mtga.js";

export class MTGAModule {
  parent: MTGA;
  name: string;
  index: number;
  onKeydown?: (event: KeyboardEvent) => void;
  onKeydownAsync?: (event: KeyboardEvent) => Promise<void>;
  onKeyup?: (event: KeyboardEvent) => void;
  onKeyupAsync?: (event: KeyboardEvent) => Promise<void>;
  onPaste?: (event: ClipboardEvent) => void;
  onPasteAsync?: (event: ClipboardEvent) => Promise<void>;

  constructor(parent: MTGA, name: string, index = 9999) {
    this.parent = parent;
    this.name = name;
    this.index = index;
  }

  static defaults = {};
}