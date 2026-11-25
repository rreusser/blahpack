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

- Whole corpus (`node bin/wrapper-replay.mjs --all`, which instruments every wrapper's `stride2offset` calls):
  - 16 modules use a length below what a valid call actually touches (definite bugs): `dger`, `dlarf`, `zunmql`, `ddisna`, `dgemv`, `dgerfs`, `dlaed2`, `dlasq2`, `zlarf`, `zsyrfs`, `dlarfx`, `zgerc`, `zgesvx`, `zhesvx`, `dgtsvx`, `zlarfx`. Examples: `zunmql` TAU 2 vs 33, `dlasq2` z N vs 4N, `FERR`/`BERR` 1 vs NRHS.
  - 275 vector parameters in 170 modules use a length other than the spec's; the commonest are TAU 63, e 39, DL/DU 18 each, FERR/BERR 15 each. The usual pattern is the main dimension N used for every vector.
- 2026-11-25 (found while closing coverage gaps for ticket 0069): `dgbtf2`, `dgbtrf`, `zgbtf2` and `zgbtrf` take IPIV's offset as `stride2offset( N, strideIPIV )`, but IPIV holds min(M,N) pivots. With a negative `strideIPIV` and M < N, the offset points past the pivots that are actually written. The new wrapper tests use stride 1, so they don't reach this.
- 2026-11-25 (ticket 0022 PR): fixed the wrapper lengths in dgbtf2, dgbtrf, zgbtf2, zgbtrf (IPIV), dorgbr, dormbr, zunmbr (TAU), zlaswp (IPIV) and dlaed2 (Q2). zlaswp and dlaed2 also got spec overrides. Each has a regression test, or the replay's length audit. The rest of the corpus is unchanged.

## Reproduce

```bash
grep -n "stride2offset" lib/lapack/base/dlarf/lib/dlarf.js
```

## Direction

Use a generic wrapper test that replays the same inputs through `<routine>.js` and through `ndarray.js` with explicit offsets. Sweep negative strides and both values of every flag that changes a vector length, and require bit-identical results. It shares its machinery with ticket 0065.

## Corpus rerun 2026-11-24

`node bin/wrapper-replay.mjs --all` with per-call watchdogs (ticket 0070). Twenty modules that used to time out now report, and three harness crashes are fixed.

Length findings, 6 modules: dlaed2 dlarrb dlarrj dormbr zlaswp zunmbr. dlarrb and dlarrj were hidden behind timeouts before.

## Evidence 2026-11-25 (ticket 0094 caller fixes)

dlaed2's `COLTYP`: the reference documents dimension N, but it always writes `COLTYP(1:4)` (`dlaed2.f:528`, `COLTYP( J ) = CTOT( J )` for J = 1..4). So the length actually touched is `max(N,4)`, as `lib/lapack/base/dlaed2/lib/dlaed2.js:53` documents. However:
- the wrapper's offset uses N (`dlaed2.js:84`, `stride2offset( N, strideCOLTYP )`);
- `lib/lapack/base/dlaed2/lib/ndarray.js:59` documents length N.

This is the same pattern as dlaed2's Q2, which the reference writes past its documented size (ticket 0022 PR).
