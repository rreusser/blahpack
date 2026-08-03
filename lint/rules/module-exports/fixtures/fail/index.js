// expect: indexNoNdarray
// FAIL — index.js exports a default but never exposes the ndarray variant
// (no named `ndarray` export and the default is not sourced from main.js).
export { default } from './something-else.js';
