---
id: 0111
title: There is no ndarray-object API: callers unpack data, strides, offsets, dimensions and workspace by hand
status: open
area: wrappers
opened: 2026-11-27
---

## Problem

Every public entry point takes raw storage. `ndarray.js` takes each array as
`data, stride1[, stride2], offset`; `<routine>.js` takes `order` and leading
dimensions. A caller holding stdlib ndarrays (or anything shaped like one:
`{ dtype, data, shape, strides, offset, order }`) has to unpack each one by
hand, pass every dimension separately, allocate length-1 typed arrays for
scalar outputs, and allocate the workspace. Each of those is a chance to pass a
wrong stride, offset or dimension, a mistake no static check sees (ticket
0013). It also differs from stdlib, whose top-level packages (e.g.
`@stdlib/blas/ddot`) take ndarrays and infer dimensions from shapes.

## Evidence

- `lib/blas/` and `lib/lapack/` contain only `base/`; no module takes an
  ndarray object.
- `lib/lapack/base/zggbal/lib/ndarray.js`: 21 positional parameters for a
  routine whose ndarray form needs 3 (`job, A, B`); `N`, 10 stride/offset
  arguments, `ilo`/`ihi` output arrays and `WORK` are all derivable or
  allocatable.
- A hand-written prototype of the ndarray-object form of zggbal (the
  sketch in `docs/ndarray-layer.md`) passes the ndarrays' `data`, `strides` and
  `offset` straight to `ndarray.js` with no copy: for both a column-major
  ndarray and a strided, offset, row-major slice view, `ilo`, `ihi`, `lscale`
  and `rscale` came out bit-identical to a direct strided call. Complex
  strides already count complex elements (CONVENTIONS C1), as stdlib's
  complex128 ndarrays do, and index arrays are already 0-based (S12).
- Spec roles that the shapes alone cannot settle (counted over `spec/*.json`
  params): `banded` 103, `packed` 123, `state` 4.

## Reproduce

```bash
ls lib/blas lib/lapack; grep -E "^function zggbal" lib/lapack/base/zggbal/lib/ndarray.js | tr ',' '\n' | wc -l
```
