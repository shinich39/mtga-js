import fs from "node:fs";
import path from "node:path";
import * as esbuild from 'esbuild';

// const pkg = JSON.parse(fs.readFileSync("./package.json", "utf8"));

const OUTPUT_FILENAME = "mtga";
const ESM = true;
const CJS = true;
const BROWSER = true;
const BROWSER_GLOBAL_NAME = "MtgaJs";

// https://esbuild.github.io/api/#external
const externalPackages = [];

// https://esbuild.github.io/api/#packages
const bundleExternalPackages = true;

const options = [];
if (ESM) {
  options.push(
    {
      entryPoints: ["./src/mtga.ts"],
      platform: BROWSER ? "browser" : "node",
      format: 'esm',
      bundle: true,
      outfile: `./dist/${OUTPUT_FILENAME}.mjs`,
      external: externalPackages,
      ...(bundleExternalPackages ? {} : { packages: "external" }),
    },
    {
      entryPoints: ["./src/mtga.ts"],
      platform: BROWSER ? "browser" : "node",
      format: 'esm',
      bundle: true,
      minify: true,
      outfile: `./dist/${OUTPUT_FILENAME}.min.mjs`,
      external: externalPackages,
      ...(bundleExternalPackages ? {} : { packages: "external" }),
    },
  );
}

if (CJS) {
  options.push(
    {
      entryPoints: ["./src/mtga.ts"],
      platform: BROWSER ? "browser" : "node",
      format: 'cjs',
      bundle: true,
      outfile: `./dist/${OUTPUT_FILENAME}.cjs`,
      external: externalPackages,
      ...(bundleExternalPackages ? {} : { packages: "external" }),
    },
    {
      entryPoints: ["./src/mtga.ts"],
      platform: BROWSER ? "browser" : "node",
      format: 'cjs',
      bundle: true,
      minify: true,
      outfile: `./dist/${OUTPUT_FILENAME}.min.cjs`,
      external: externalPackages,
      ...(bundleExternalPackages ? {} : { packages: "external" }),
    },
  );
}

if (BROWSER) {
  options.push(
    {
      entryPoints: ["./src/mtga.ts"],
      platform: "browser",
      format: "iife",
      globalName: BROWSER_GLOBAL_NAME,
      bundle: true,
      outfile: `./dist/${OUTPUT_FILENAME}.js`,
      external: externalPackages,
    },
    {
      entryPoints: ["./src/mtga.ts"],
      platform: "browser",
      format: "iife",
      globalName: BROWSER_GLOBAL_NAME,
      bundle: true,
      minify: true,
      outfile: `./dist/${OUTPUT_FILENAME}.min.js`,
      external: externalPackages,
    },
  );
}

// clear
if (fs.existsSync("./dist")) {
  fs.rmSync("./dist", { recursive: true });
}

// build
for (const option of options) {
  await esbuild.build(option);
}