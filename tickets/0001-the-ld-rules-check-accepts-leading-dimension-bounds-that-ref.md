---
id: 0001
title: The `ld-rules` check accepts leading-dimension bounds that reference array arguments
status: open
area: conformance
opened: 2026-11-18
---

## Problem

`bin/conformance/ld-rules.js` resolves a Fortran identifier to a same-named wrapper parameter without checking that the parameter is a scalar, and the `ld-rules` check then verifies the wrapper against that same generated text. When the Fortran bound names an *output* (`M`, the count of eigenvalues or vectors found), the generated check compares a leading dimension against an `Int32Array`: `max( 1, Int32Array )` is `NaN`, `LD < NaN` is false, and the check can never fire. The generator and the check share the mistake, so conformance passes.

## Evidence

- `lib/lapack/base/dstevx/lib/dstevx.js:77`: row-major `LDZ < max( 1, max( 1, M ) )`. The real column count of `Z` follows `range`/`il`/`iu`/`N`.
- `lib/lapack/base/dtgsna/lib/dtgsna.js:72,78`: row-major `LDVL`/`LDVR < max( 1, M )`. The declared column count is `mm`.
- A scan of every wrapper's generated condition for array-typed identifiers finds only these three. Type-checking with stdlib's declarations loaded also flags them (ticket 0003).

## Reproduce

```bash
grep -n 'max( 1, M )\|max( 1, max( 1, M ) )' lib/lapack/base/dstevx/lib/dstevx.js lib/lapack/base/dtgsna/lib/dtgsna.js
```
