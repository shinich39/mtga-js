import { MTGA } from "../mtga.js";
import { MTGAModule } from "../types/module.js";
import { getRows } from "../types/row.js";
import { parseKeyboardEvent } from "./utils.js";

const IS_SUPPORTED = !!navigator.clipboard?.writeText;

const onKeydownAsync = async function (this: LineCutModule, e: KeyboardEvent) {
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

  const isValid = !isRange && ctrlKey && !altKey && !shiftKey && key.toLowerCase() === "x";
  if (!isValid) {
    return;
  }

  e.preventDefault();

  const rows = getRows(el);

  let data = "",
      newValues: string[] = [], 
      newShort = short, 
      newLong = long;

  for (const row of rows) {
    const isSelected = row.isSelected;
    if (!isSelected) {
      newValues.push(row.value);
    } else {
      newShort = row.startIndex;
      newLong = row.startIndex;
      data = row.value;
    }
  }

  if (!data) {
    // console.warn(`No data selected`);
    return;
  }

  if (!data.endsWith("\n")) {
    data += "\n";
  }

  await navigator.clipboard.writeText(data);

  mtga.setState({
    isReversed: false,
    short: newShort,
    long: newLong,
    value: newValues.join(""),
  });
}

export class LineCutModule extends MTGAModule {
  constructor(parent: MTGA) {
    super(parent, LineCutModule.name);
  }

  onKeydownAsync = onKeydownAsync;

  static name = "LineCut";

  static defaults = {};
}