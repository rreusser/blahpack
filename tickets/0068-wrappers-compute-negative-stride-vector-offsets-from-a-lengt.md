---
id: 0068
title: Wrappers compute negative-stride vector offsets from a length that can be wrong, and nothing checks it
status: open
area: wrappers
opened: 2026-11-23
---

## Problem

A `<routine>.js` wrapper converts each vector stride into a starting offset with `stride2offset( n, stride )`. For a negative stride the offset is `(n-1)*|stride|`, so `n` must be the vector's true length. Where the length depends on a flag (SIDE, TRANS, UPLO), the wrapper can use the wrong one. Positive strides hide the error, because the offset is then 0 whatever `n` is. Nothing tests wrappers with negative strides, and coverage cannot see it: the line runs either way.

## Evidence

- `lib/lapack/base/dlarf/lib/dlarf.js` uses `stride2offset( N, strideV )`, but V has M elements when SIDE = 'L' (`dlarf.f`: `(1 + (M-1)*abs(INCV)) if SIDE = 'L'`). The call `dlarf( 'column-major', 'left', 4, 2, v, -1, 1.5, C, 4, null )` returns all NaN. `base.js` with offset M-1 returns finite, correct values.
- Wrappers make 1,767 `stride2offset` calls. The `n` in each comes from the spec, which flattens flag-conditional sizes (ticket 0062).

## Reproduce

```bash
grep -n "stride2offset" lib/lapack/base/dlarf/lib/dlarf.js
```

## Direction

Use a generic wrapper test that replays the same inputs through `<routine>.js` and through `ndarray.js` with explicit offsets. Sweep negative strides and both values of every flag that changes a vector length, and require bit-identical results. It shares its machinery with ticket 0065.
