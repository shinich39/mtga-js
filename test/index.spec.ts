import { deepStrictEqual as eq } from "node:assert";
import { test } from "@playwright/test";
import type * as index from "../src/index.js";

declare global {
  interface Window {
    mtgaJs: typeof index;
  }
}

test("MTGA", async ({ page }) => {
  await page.goto("about:blank");
  await page.addScriptTag({ path: "./dist/mtga.js" });

  const result = await page.evaluate<boolean>(() => {
    const MTGA = window.mtgaJs.MTGA;

    const el = document.createElement("textarea");
    
    const mtga = new MTGA(el);

    return !!mtga;
  });

  eq(result, true);
});
