import fs from "node:fs";
import * as esbuild from "esbuild";

const pkg = JSON.parse(fs.readFileSync("./package.json"));

const ENTRY_POINTS = ["./src/index.ts"];
const FILENAME = "mtga";

const ESM = true;
const CJS = true;
const BROWSER = true;
const BROWSER_GLOBAL_NAME = "mtgaJs";

/** @see https://esbuild.github.io/api/#external */
const EXTERNAL_PACKAGES = [];

const paths = {
  type: `./dist/types/index.d.ts`,
  esm: `./dist/${FILENAME}.mjs`,
  esmMin: `./dist/${FILENAME}.min.mjs`,
  cjs: `./dist/${FILENAME}.cjs`,
  cjsMin: `./dist/${FILENAME}.min.cjs`,
  browser: `./dist/${FILENAME}.js`,
  browserMin: `./dist/${FILENAME}.min.js`,
};

const isPackageChanged =
  pkg.main !== paths.esmMin ||
  pkg.module !== paths.esmMin ||
  pkg.types !== paths.type ||
  pkg.exports["."].types !== paths.type ||
  pkg.exports["."].import !== paths.esmMin ||
  pkg.exports["."].require !== paths.cjsMin;

/** @type {import("esbuild").BuildOptions[]} */
const buildOptions = [];

if (ESM) {
  buildOptions.push(
    {
      entryPoints: ENTRY_POINTS,
      platform: "node",
      format: "esm",
      bundle: true,
      sourcemap: true,
      outfile: paths.esm,
      external: EXTERNAL_PACKAGES,
    },
    {
      entryPoints: ENTRY_POINTS,
      platform: "node",
      format: "esm",
      bundle: true,
      minify: true,
      sourcemap: true,
      outfile: paths.esmMin,
      external: EXTERNAL_PACKAGES,
    },
  );
}

if (CJS) {
  buildOptions.push(
    {
      entryPoints: ENTRY_POINTS,
      platform: "node",
      format: "cjs",
      bundle: true,
      sourcemap: true,
      outfile: paths.cjs,
      external: EXTERNAL_PACKAGES,
    },
    {
      entryPoints: ENTRY_POINTS,
      platform: "node",
      format: "cjs",
      bundle: true,
      minify: true,
      sourcemap: true,
      outfile: paths.cjsMin,
      external: EXTERNAL_PACKAGES,
    },
  );
}

if (BROWSER) {
  buildOptions.push(
    {
      entryPoints: ENTRY_POINTS,
      platform: "browser",
      format: "iife",
      globalName: BROWSER_GLOBAL_NAME,
      bundle: true,
      sourcemap: true,
      outfile: paths.browser,
      external: EXTERNAL_PACKAGES,
    },
    {
      entryPoints: ENTRY_POINTS,
      platform: "browser",
      format: "iife",
      globalName: BROWSER_GLOBAL_NAME,
      bundle: true,
      minify: true,
      sourcemap: true,
      outfile: paths.browserMin,
      external: EXTERNAL_PACKAGES,
    },
  );
}

// clear ./dist
if (fs.existsSync("./dist")) {
  fs.rmSync("./dist", { recursive: true });
}

// create scripts
for (const option of buildOptions) {
  await esbuild.build(option);
}

// update package.json
if (isPackageChanged) {
  pkg.main = paths.esmMin;
  pkg.module = paths.esmMin;
  pkg.types = paths.type;
  pkg.exports["."].types = paths.type;
  pkg.exports["."].import = paths.esmMin;
  pkg.exports["."].require = paths.cjsMin;
  fs.writeFileSync("./package.json", JSON.stringify(pkg, null, 2), "utf8");
}