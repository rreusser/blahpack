# dorgqr: Translation Learnings

## Translation pitfalls

- Direct real analog of zungqr; no complex arithmetic needed. Translation was
  straightforward by stripping the reinterpret/complex layers from zungqr.
- The Fortran WORK array serves dual purpose as both dlarft's T output and
  dlarfb's scratch space. They share the same array with the same leading
  dimension (LDWORK=N), but use non-overlapping rows: T occupies rows 0..IB-1,
  scratch occupies rows IB..N-1 in each column. In JS, both point to the same
  `work` array with the same strides but different offsets (0 vs ib).
- WORK is allocated internally (N*NB Float64Array) rather than relying on the
  caller-provided WORK parameter, following the convention used by zungqr.

## Dependency interface surprises

- dlarft takes `(T, strideT1, strideT2, offsetT)` as a 2D output matrix,
  while dlarfb takes both T and WORK as 2D matrices with separate stride pairs.
  When sharing the same underlying array, the strides are `(1, ldwork)` for both.
- dorg2r uses a 1D WORK parameter `(WORK, strideWORK, offsetWORK)`, not a 2D
  one. This is different from dlarfb/dlarft which take 2D WORK.

## Automation opportunities

- The translation from zungqr to dorgqr is mechanical: remove reinterpret,
  remove complex-element stride doubling (sa1/sa2), remove imaginary-part zeroing.
  Could be automated as a "z-to-d" transform for blocked routines that share
  the same structure.

## Coverage gaps

- 100% line and branch coverage achieved.
- Blocked path exercised by 40x35 K=35 (NB=32, one block of 32 + remainder of 3)
  and 40x40 K=34 (exercises the zeroing loop for columns beyond kk).
- For the blocked test, exact element-by-element comparison against Fortran is
  not possible because JS dgeqrf and Fortran DGEQRF may use different blocking
  strategies (different ILAENV values). Orthogonality (Q^T*Q = I) is verified
  instead.

## Complex number handling

- N/A: dorgqr is a real routine (no complex arithmetic).
