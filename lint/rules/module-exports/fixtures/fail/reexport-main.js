// expect: noAttach
// FAIL — the pre-0124 index.js, which re-exported a main.js that no longer
// exists (fix: node bin/codemod-fold-main.mjs <routine>).
export { default } from './main.js';
export { default as strided } from './strided.js';
