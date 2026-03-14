import type { IPairs } from "../types/pair.js";

export const parseKeyboardEvent = (
  e: KeyboardEvent,
): {
  key: string;
  altKey: boolean;
  shiftKey: boolean;
  ctrlKey: boolean;
} => {
  const key = e.key;
  const altKey = e.altKey;
  const shiftKey = e.shiftKey;
  const ctrlKey = e.ctrlKey || e.metaKey;

  return {
    key,
    altKey,
    shiftKey,
    ctrlKey,
  };
};
