---
id: 0098
title: dlamrg returns 1-based INDEX values although S12 makes public index arrays 0-based, and nothing checks index outputs
status: open
area: wrappers
opened: 2026-11-25
---

## Problem

CONVENTIONS S12 says public pivot/index arrays are 0-based, with the Fortran 1-based values converted inside `base.js`. dlamrg's `INDEX` (spec `role: index`) holds 1-based values. Its two entry points document this inconsistently:
- `lib/lapack/base/dlamrg/lib/dlamrg.js:28` says "(0-based)";
- `lib/lapack/base/dlamrg/lib/ndarray.js:38` says "1-based values".

Its internal callers compensate for the 1-based values: dlaed2 (`base.js:125`, "dlamrg outputs 1-based indices"), dlasd2 (`base.js:176`) and dlasd7.

How it was permitted: S12's only enforcer is `harness:reconstruction`, the pivot round-trip of factorizations. No check covers other `role: index` outputs (merge permutations, sort indices, deflation maps), so their base is whatever the translation chose, and the docs are unchecked text.

## Evidence

- The ticket 0094 caller-fix agent (part 06) ran the dlamrg example with n1 = n2 = 3 and got INDEX = [1,6,2,5,3,4].
- Other index outputs may have the same problem. Unknown how many: the spec's `role: index` params have no recorded base.

## Reproduce

```bash
grep -n "INDEX" lib/lapack/base/dlamrg/lib/dlamrg.js lib/lapack/base/dlamrg/lib/ndarray.js | grep param; grep -n "1-based" lib/lapack/base/{dlaed2,dlasd2,dlasd7}/lib/base.js
```
## Evidence 2026-11-25 (2): dstebz IBLOCK/ISPLIT

The ticket 0094 part-11 agent found that dstebz outputs 1-based IBLOCK and ISPLIT (IBLOCK = [1,1,1,1], ISPLIT = [4] for a 4×4 unsplit matrix). dstein's tests pass 1-based values too, but dstein/zstein's JSDoc calls them 0-based. S12 names `IBLOCK` explicitly as a 0-based public array.
