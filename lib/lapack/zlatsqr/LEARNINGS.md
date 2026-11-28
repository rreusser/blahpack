# zlatsqr: Translation Learnings

## Translation pitfalls

- **Mechanical d-to-z port.** zlatsqr's body is structurally identical to
  dlatsqr (no complex arithmetic in the driver itself — it merely
  dispatches to zgeqrt and ztpqrt). The only changes are the JSDoc type
  (`Float64Array` -> `Complex128Array`) and the dependency requires.
  The same loop-bound logic (`for (i = mb; i <= ii - (mb-N); i += mb-N)`)
  and same `ctr * N * strideT2` T-offset apply unchanged.

- **`zgeqrt`/`ztpqrt` accept `Complex128Array` directly.** The base.js
  signatures of zgeqrt and ztpqrt mirror dgeqrt/dtpqrt exactly (same
  parameter order and same semantic stride/offset units), so all the
  call sites in dlatsqr translate verbatim. The driver never needs to
  call `reinterpret()` itself.

- **`numBlocks` test helper edge case (carried over from dlatsqr).**
  Naive `Math.ceil((M-N)/(MB-N))` returns 0 when `M==N`, allocating a
  zero-length T even though the routine takes the zgeqrt fallback and
  writes `nb*N` entries. The helper must guard
  `if (MB <= N || MB >= M) return 1;` to mirror the base dispatch.

- **T storage for trailing block uses `ctr * N * strideT2` not
  `ctr * nb * strideT2`.** Each per-block T occupies an `nb`-by-`N`
  slab; the slab advances by `N` along the second axis, not by `nb`.
  Same trap as dlatsqr.

## Dependency interface surprises

- **Driver doesn't need cmplx.js.** zlatsqr never performs complex
  arithmetic itself; it only chains zgeqrt and ztpqrt. No `reinterpret`
  call, no inline complex math.

- **`ztpqrt` aliasing of A and B works.** The first matrix argument is
  the running R block (top of A) and the second is the next row block
  (also in A but at a different row offset). Both alias the same
  Complex128Array but with non-overlapping logical regions, just like
  dtpqrt in dlatsqr.

## Complex number handling

- **Fortran test uses `complex*16` with `equivalence` to print
  re/im interleaved.** Each test subroutine declares exact-size
  `A(M,N)` and `T(NB,TC)` with a parallel `double precision A_r(2,M,N)`
  via `equivalence`, then `print_array(A_r, 2*M*N)` emits the
  interleaved Float64 stream consumed directly by Complex128Array on
  the JS side.

- **Per-subroutine exact-size arrays sidestep the LD/EQUIVALENCE trap.**
  Following the zgeqrt template, each test case lives in its own
  subroutine with `LDA = M` and `LDT = NB`, so the equivalenced
  `A_r` buffer maps 1:1 to the Float64 view of the JS Complex128Array
  (no padding from larger allocations).

## Coverage / test design

- **All four file types hit 100% line + branch coverage.** The blocked
  path is exercised by m8/m12 cases (KK > 0 trailing block) and the
  m10/m20 cases (KK == 0 even division). The fallback path covers M=N,
  MB > M, and MB == N. Quick returns for M=0 and N=0 round it out.
  A row-major test of the BLAS-style wrapper covers the
  `order !== 'column-major'` branches in zlatsqr.js.

## Missing automation

- **Scaffold still leaves `lwork` parameter and the `MB` validator
  defaults wrong (same as dlatsqr).** init_routine.py copies the
  Fortran signature including LWORK, but the project rule strips
  workspace-query params; the JS-side base/ndarray/wrapper signatures
  must be edited by hand. Likewise the auto-generated LDT validator
  uses `max(1,M/N)` but compact-WY routines need `LDT >= nb`.
