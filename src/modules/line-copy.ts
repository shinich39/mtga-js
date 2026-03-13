import type { MTGA } from "../index.js";
import { MTGAModule } from "../types/module.js";
import { getRows } from "../utils/row.js";
import { parseKeyboardEvent } from "../utils/event.js";

const IS_SUPPORTED = !!navigator.clipboard?.writeText;

const onKeydown = async function (this: LineCopyModule, e: KeyboardEvent): Promise<void> {
  if (e.defaultPrevented) {
    return;
  }

  if (!IS_SUPPORTED) {
    console.warn(`navigator.clipboard.writeText not found`);
    return;
  }

  const mtga = this.parent;
  const el = this.parent.element;

  const { key, altKey, ctrlKey, shiftKey } = parseKeyboardEvent(e);
  const { short, long, dir, isReversed } = mtga.getState();

  const isRange = short !== long;

  const isValid = !isRange && ctrlKey && !altKey && !shiftKey && key.toLowerCase() === "c";
  if (!isValid) {
    return;
  }

  e.preventDefault();

  const rows = getRows(el);
  let data = rows.find((r) => r.isSelected)?.value;

  if (!data) {
    // console.warn(`No data selected`);
    return;
  }

  if (!data.endsWith("\n")) {
    data += "\n";
  }

  await navigator.clipboard.writeText(data);
};

export class LineCopyModule extends MTGAModule {
  constructor(parent: MTGA) {
    super(parent, LineCopyModule.name);
  }

  onKeydown: typeof onKeydown = onKeydown;

  static name = "LineCopy";

  static defaults = {};
}
