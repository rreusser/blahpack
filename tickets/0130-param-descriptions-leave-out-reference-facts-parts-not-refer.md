---
id: 0130
title: @param descriptions leave out reference facts: parts not referenced, contents destroyed on exit
status: open
area: docs
opened: 2026-11-27
---

## Problem

Translators wrote each module's `@param` descriptions by hand, and about half of
the array descriptions are placeholders ("input matrix", "input/output matrix",
"output array"). Most of what the reference documents per argument is still
available: `spec/<routine>.json` `params[].reference` carries it, and the docs
site shows it under each parameter. But two kinds of fact change how a caller
uses an argument, and a summary that leaves them out is wrong rather than
merely short:

- **not referenced**: which part of the argument is read ("the strictly lower
  triangular part of A is not referenced" when UPLO = 'U'), or when it is not
  read at all ("Not referenced if JOBVL = 'N'");
- **destroyed on exit**: "On exit, B has been overwritten." `zggev` says
  "second complex matrix (modified in-place)", which reads as a meaningful
  output.

## Evidence

`node bin/reference-facts.mjs` (2026-11-27): 426 `@param` descriptions in 267
modules: 399 not-referenced, 27 destroyed. Examples:

- `zggev` `A`, `B` (destroyed), `VL`, `VR` (not referenced unless the
  eigenvectors are requested);
- `dgeevx` `A` (destroyed), `VL`, `VR`;
- `dpotrf` `A`, `dsymm` `A` (which triangle is read).

## Reproduce

```bash
node bin/reference-facts.mjs --list
node bin/reference-facts.mjs zggev
```

## Direction

Fix the descriptions in waves (CLAUDE.md batch rule), using the spec's
`reference` text as the source. Use the JS option names (`'compute-vectors'`,
`'upper'`), not the Fortran letters. Once the script exits 0, add it to CI
(or turn it into a lint rule under lint/rules/) and move its `bin/checks.json`
entry from `ticket` to `gate`.
