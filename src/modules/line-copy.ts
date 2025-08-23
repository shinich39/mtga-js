import { MTGA } from "../mtga.js";
import { IModule } from "../types/module.js";
import { getRows } from "../types/row.js";
import { getState } from "../types/state.js";
import { parseKeyboardEvent } from "./utils.js";

const IS_SUPPORTED = !!navigator.clipboard?.writeText;

const onKeydownAsync = async function (this: LineCopyModule, e: KeyboardEvent) {
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
  const { short, long, dir, isReversed } = getState(el);

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
}

export class LineCopyModule extends IModule {
  constructor(parent: MTGA) {
    super(parent, LineCopyModule.name);
  }

  onKeydownAsync = onKeydownAsync;

  static name = "LineCopy";

  static defaults = {};
}