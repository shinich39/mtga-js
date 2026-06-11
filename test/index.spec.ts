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

test("destroy unregisters textarea", async ({ page }) => {
  await page.goto("about:blank");
  await page.addScriptTag({ path: "./dist/mtga.js" });

  const result = await page.evaluate(() => {
    const MTGA = window.mtgaJs.MTGA;

    const el = document.createElement("textarea");
    const mtga = new MTGA(el);

    const existsBeforeDestroy = MTGA.exists(el);

    mtga.destroy();

    return {
      existsBeforeDestroy,
      existsAfterDestroy: MTGA.exists(el),
      lookupAfterDestroy: MTGA.getMTGA(el),
    };
  });

  eq(result, {
    existsBeforeDestroy: true,
    existsAfterDestroy: false,
    lookupAfterDestroy: undefined,
  });
});

test("comment toggles after shared leading whitespace", async ({ page }) => {
  await page.goto("about:blank");
  await page.addScriptTag({ path: "./dist/mtga.js" });

  const result = await page.evaluate(() => {
    const MTGA = window.mtgaJs.MTGA;
    const CommentModule = window.mtgaJs.CommentModule;

    const el = document.createElement("textarea");
    document.body.appendChild(el);

    el.value = "  foo\n    bar";
    el.setSelectionRange(0, el.value.length);

    const mtga = new MTGA(el);
    const commentModule = mtga.getModule<typeof mtga.modules[string]>(CommentModule.name);

    const createEvent = () =>
      ({
        defaultPrevented: false,
        key: "/",
        altKey: false,
        ctrlKey: true,
        metaKey: false,
        shiftKey: false,
        preventDefault(this: { defaultPrevented: boolean }) {
          this.defaultPrevented = true;
        },
      }) as KeyboardEvent;

    commentModule?.onKeydown?.call(commentModule, createEvent());

    const commented = el.value;

    commentModule?.onKeydown?.call(commentModule, createEvent());

    return {
      commented,
      uncommented: el.value,
    };
  });

  eq(result, {
    commented: "  // foo\n  //   bar",
    uncommented: "  foo\n    bar",
  });
});

test("auto indent keeps current line indentation without brackets", async ({ page }) => {
  await page.goto("about:blank");
  await page.addScriptTag({ path: "./dist/mtga.js" });

  const result = await page.evaluate(() => {
    const MTGA = window.mtgaJs.MTGA;
    const AutoIndentModule = window.mtgaJs.AutoIndentModule;

    const el = document.createElement("textarea");
    document.body.appendChild(el);

    el.value = "  alpha";
    el.setSelectionRange(el.value.length, el.value.length);

    const mtga = new MTGA(el);
    const autoIndentModule = mtga.getModule<typeof mtga.modules[string]>(AutoIndentModule.name);

    autoIndentModule?.onKeydown?.call(autoIndentModule, {
      defaultPrevented: false,
      key: "Enter",
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
      preventDefault(this: { defaultPrevented: boolean }) {
        this.defaultPrevented = true;
      },
    } as KeyboardEvent);

    return el.value;
  });

  eq(result, "  alpha\n  ");
});

test("auto indent outdents before inserting a closing bracket", async ({ page }) => {
  await page.goto("about:blank");
  await page.addScriptTag({ path: "./dist/mtga.js" });

  const result = await page.evaluate(() => {
    const MTGA = window.mtgaJs.MTGA;
    const AutoIndentModule = window.mtgaJs.AutoIndentModule;

    const el = document.createElement("textarea");
    document.body.appendChild(el);

    el.value = "{\n  ";
    el.setSelectionRange(el.value.length, el.value.length);

    const mtga = new MTGA(el);
    const autoIndentModule = mtga.getModule<typeof mtga.modules[string]>(AutoIndentModule.name);

    autoIndentModule?.onKeydown?.call(autoIndentModule, {
      defaultPrevented: false,
      key: "}",
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
      preventDefault(this: { defaultPrevented: boolean }) {
        this.defaultPrevented = true;
      },
    } as KeyboardEvent);

    return {
      value: el.value,
      selectionStart: el.selectionStart,
      selectionEnd: el.selectionEnd,
    };
  });

  eq(result, {
    value: "{\n}",
    selectionStart: 3,
    selectionEnd: 3,
  });
});

test("auto indent keeps closing bracket dedented after whitespace-only line", async ({ page }) => {
  await page.goto("about:blank");
  await page.addScriptTag({ path: "./dist/mtga.js" });

  const result = await page.evaluate(() => {
    const MTGA = window.mtgaJs.MTGA;
    const AutoIndentModule = window.mtgaJs.AutoIndentModule;

    const el = document.createElement("textarea");
    document.body.appendChild(el);

    el.value = "{\n  }";
    el.setSelectionRange(4, 4);

    const mtga = new MTGA(el);
    const autoIndentModule = mtga.getModule<typeof mtga.modules[string]>(AutoIndentModule.name);

    autoIndentModule?.onKeydown?.call(autoIndentModule, {
      defaultPrevented: false,
      key: "Enter",
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
      preventDefault(this: { defaultPrevented: boolean }) {
        this.defaultPrevented = true;
      },
    } as KeyboardEvent);

    return {
      value: el.value,
      selectionStart: el.selectionStart,
      selectionEnd: el.selectionEnd,
    };
  });

  eq(result, {
    value: "{\n  \n}",
    selectionStart: 5,
    selectionEnd: 5,
  });
});

test("auto pair overtypes an existing closing character", async ({ page }) => {
  await page.goto("about:blank");
  await page.addScriptTag({ path: "./dist/mtga.js" });

  const result = await page.evaluate(() => {
    const MTGA = window.mtgaJs.MTGA;
    const AutoPairModule = window.mtgaJs.AutoPairModule;

    const el = document.createElement("textarea");
    document.body.appendChild(el);

    el.value = "()";
    el.setSelectionRange(1, 1);

    const mtga = new MTGA(el);
    const autoPairModule = mtga.getModule<typeof mtga.modules[string]>(AutoPairModule.name);

    autoPairModule?.onKeydown?.call(autoPairModule, {
      defaultPrevented: false,
      key: ")",
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
      preventDefault(this: { defaultPrevented: boolean }) {
        this.defaultPrevented = true;
      },
    } as KeyboardEvent);

    return {
      value: el.value,
      selectionStart: el.selectionStart,
      selectionEnd: el.selectionEnd,
    };
  });

  eq(result, {
    value: "()",
    selectionStart: 2,
    selectionEnd: 2,
  });
});

test("auto pair keeps reversed selection while wrapping", async ({ page }) => {
  await page.goto("about:blank");
  await page.addScriptTag({ path: "./dist/mtga.js" });

  const result = await page.evaluate(() => {
    const MTGA = window.mtgaJs.MTGA;
    const AutoPairModule = window.mtgaJs.AutoPairModule;

    const el = document.createElement("textarea");
    document.body.appendChild(el);

    el.value = "hello";
    el.focus();
    el.setSelectionRange(2, 5, "backward");

    const mtga = new MTGA(el);
    const autoPairModule = mtga.getModule<typeof mtga.modules[string]>(AutoPairModule.name);

    autoPairModule?.onKeydown?.call(autoPairModule, {
      defaultPrevented: false,
      key: "(",
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      shiftKey: true,
      preventDefault(this: { defaultPrevented: boolean }) {
        this.defaultPrevented = true;
      },
    } as KeyboardEvent);

    return {
      value: el.value,
      selectionStart: el.selectionStart,
      selectionEnd: el.selectionEnd,
      selectionDirection: el.selectionDirection,
    };
  });

  eq(result, {
    value: "he(llo)",
    selectionStart: 3,
    selectionEnd: 6,
    selectionDirection: "backward",
  });
});

test("auto pair keeps multiline selection while wrapping", async ({ page }) => {
  await page.goto("about:blank");
  await page.addScriptTag({ path: "./dist/mtga.js" });

  const result = await page.evaluate(() => {
    const MTGA = window.mtgaJs.MTGA;
    const AutoPairModule = window.mtgaJs.AutoPairModule;

    const el = document.createElement("textarea");
    document.body.appendChild(el);

    el.value = "foo\nbar";
    el.setSelectionRange(0, el.value.length);

    const mtga = new MTGA(el);
    const autoPairModule = mtga.getModule<typeof mtga.modules[string]>(AutoPairModule.name);

    autoPairModule?.onKeydown?.call(autoPairModule, {
      defaultPrevented: false,
      key: "{",
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      shiftKey: true,
      preventDefault(this: { defaultPrevented: boolean }) {
        this.defaultPrevented = true;
      },
    } as KeyboardEvent);

    return {
      value: el.value,
      selectionStart: el.selectionStart,
      selectionEnd: el.selectionEnd,
    };
  });

  eq(result, {
    value: "{foo\nbar}",
    selectionStart: 1,
    selectionEnd: 8,
  });
});

test("auto pair ignores composing keydown", async ({ page }) => {
  await page.goto("about:blank");
  await page.addScriptTag({ path: "./dist/mtga.js" });

  const result = await page.evaluate(() => {
    const MTGA = window.mtgaJs.MTGA;
    const AutoPairModule = window.mtgaJs.AutoPairModule;

    const el = document.createElement("textarea");
    document.body.appendChild(el);

    el.value = "ㄹ";
    el.setSelectionRange(1, 1);

    const mtga = new MTGA(el);
    const autoPairModule = mtga.getModule<typeof mtga.modules[string]>(AutoPairModule.name);

    autoPairModule?.onKeydown?.call(autoPairModule, {
      defaultPrevented: false,
      key: "(",
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      shiftKey: true,
      isComposing: true,
      keyCode: 229,
      preventDefault(this: { defaultPrevented: boolean }) {
        this.defaultPrevented = true;
      },
    } as KeyboardEvent);

    return {
      value: el.value,
      selectionStart: el.selectionStart,
      selectionEnd: el.selectionEnd,
    };
  });

  eq(result, {
    value: "ㄹ",
    selectionStart: 1,
    selectionEnd: 1,
  });
});

test("auto indent ignores composing enter", async ({ page }) => {
  await page.goto("about:blank");
  await page.addScriptTag({ path: "./dist/mtga.js" });

  const result = await page.evaluate(() => {
    const MTGA = window.mtgaJs.MTGA;
    const AutoIndentModule = window.mtgaJs.AutoIndentModule;

    const el = document.createElement("textarea");
    document.body.appendChild(el);

    el.value = "ㄹ";
    el.setSelectionRange(1, 1);

    const mtga = new MTGA(el);
    const autoIndentModule = mtga.getModule<typeof mtga.modules[string]>(AutoIndentModule.name);

    autoIndentModule?.onKeydown?.call(autoIndentModule, {
      defaultPrevented: false,
      key: "Enter",
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
      isComposing: true,
      keyCode: 229,
      preventDefault(this: { defaultPrevented: boolean }) {
        this.defaultPrevented = true;
      },
    } as KeyboardEvent);

    return {
      value: el.value,
      selectionStart: el.selectionStart,
      selectionEnd: el.selectionEnd,
    };
  });

  eq(result, {
    value: "ㄹ",
    selectionStart: 1,
    selectionEnd: 1,
  });
});
