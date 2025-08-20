import { MTGA } from "../mtga.js";
import { IModule } from "../types/module.js";
import { getRows, parseKeyboardEvent, getState } from "./utils.js";

const IS_SUPPORTED = !!navigator.clipboard?.writeText;

const onKeydown = function (this: MTGA, e: KeyboardEvent) {
  if (e.defaultPrevented) {
    return;
  }

  if (!IS_SUPPORTED) {
    console.warn(`navigator.clipboard.writeText not found`);
    return;
  }

  const el = this.element;
  const { key, altKey, ctrlKey, shiftKey } = parseKeyboardEvent(e);
  const { short, long, dir, isReversed } = getState(el);

  const isRange = short !== long;

  const isValid = !isRange && ctrlKey && !altKey && !shiftKey && key.toLowerCase() === "c";
  if (!isValid) {
    return;
  }

  e.preventDefault();

  const rows = getRows(el);
  const data = rows.find((r) => r.isSelected)?.value;

  if (!data) {
    console.warn(`No data selected`);
    return;
  }

  navigator.clipboard.writeText(data);
}

export class LineCopyModule extends IModule {
  constructor(parent: MTGA) {
    super(parent, LineCopyModule.name);
  }

  onKeydown = onKeydown;

  static name = "LineCopy";
  static defaults = {};
}