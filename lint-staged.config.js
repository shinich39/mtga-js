/** @type {import('lint-staged').Configuration} */
export default {
  "src/**/*.{ts,tsx,js,jsx}": "biome check --write"
}