/** @type {import('lint-staged').Configuration} */
export default {
  "src/**/*.{ts,tsx,js}": (files) => 
    `eslint ${files.filter((file) => !/\.test\.(?:ts|tsx|js)$/.test(file)).join(' ')}`,
}