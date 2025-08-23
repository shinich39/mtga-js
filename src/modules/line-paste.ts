import { MTGA } from "../mtga.js";
import { IModule } from "../types/module.js";
import { getRows } from "../types/row.js";
import { getState } from "../types/state.js";
import { parseKeyboardEvent } from "./utils.js";

const IS_SUPPORTED = !!navigator.clipboard?.readText;

const onPaste = function (this: LinePasteModule, e: ClipboardEvent) {
  if (e.defaultPrevented) {
    return;
  }

  if (!IS_SUPPORTED) {
    console.warn(`navigator.clipboard?.readText not found`);
    return;
  }

  const mtga = this.parent;
  const el = this.parent.element;

  const { short, long, dir, isReversed } = getState(el);

  const isRange = short !== long;

  const isValid = !isRange;
  if (!isValid) {
    return;
  }

  let copiedText = e.clipboardData?.getData("text");
  if (!copiedText) {
    // console.warn(`No data copied`);
    return;
  }

  // normalize windows linebreak
  copiedText = copiedText.replace(/\r\n|\r/g, "\n");

  // supports single line copy only
  const copiedRows = copiedText.split("\n");
  const isSingleLine = copiedRows.length === 2;
  const isLastLineEmpty = copiedRows[copiedRows.length - 1] === "";

  if (!isSingleLine || !isLastLineEmpty) {
    // console.warn(`Multi line copied`);
    return;
  }

  e.preventDefault();

  const rows = getRows(el);

  let newValues: string[] = [], 
      newShort = short + copiedText.length,
      newLong = long + copiedText.length;

  for (const row of rows) {
    const isSelected = row.isSelected;
    if (isSelected) {
      newValues.push(copiedText);
    }

    newValues.push(row.value);
  }

  mtga.setState({
    isReversed,
    short: newShort,
    long: newLong,
    dir,
    value: newValues.join(""),
  });

  mtga.addHistory();
}

export class LinePasteModule extends IModule {
  constructor(parent: MTGA) {
    super(parent, LinePasteModule.name);
  }

  onPaste = onPaste;

  static name = "LinePaste";

  static defaults = {};
}