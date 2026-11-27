# zhbgvx: Translation Learnings

## Translation pitfalls

- The Fortran ZHBGVX is structurally identical to the real counterpart DSBGVX, with workspace
  arrays split into complex (WORK) and real (RWORK). The tridiagonal diagonal/off-diagonal
  (d, e) are stored in RWORK, not WORK. Eigenvalues W are always real (Float64Array).
- zhbgst expects vect='update'/'none' (not 'compute-vectors'/'no-vectors'), matching the
  convention used by dsbgst. Similarly zhbtrd uses 'update'/'none'/'initialize'.

## Dependency interface surprises

- zgemv takes Complex128 scalar objects (CONE, CZERO) for alpha/beta, not plain numbers.
  The real dgemv takes plain floats. This requires constructing Complex128 constants.
- zcopy and zswap operate on Complex128Array with strides/offsets in complex elements,
  while dcopy operates on Float64Array. Both are used in this routine: dcopy for real
  arrays (d, e, w) and zcopy for complex column extraction before zgemv back-transform.
- zstein outputs to Complex128Array (Z) with complex-element strides, but its d/e/w/WORK
  inputs are Float64Array. The IBLOCK/ISPLIT come from IWORK partitioned by the caller.

## Automation opportunities

- The translation from dsbgvx to zhbgvx is highly mechanical: replace d-prefix deps with
  z-prefix deps, split WORK into WORK (complex) + RWORK (real), and swap scalar constants.
  Could be partially automated by a real-to-complex translation pass.

## Coverage gaps

- All code paths exercised: fast path (RANGE='A', abstol<=0) with and without vectors,
  selective path (RANGE='V', RANGE='I'), upper and lower storage, N=0, N=1, diagonal matrices.
- No test for dsterf/zsteqr failure fallthrough to dstebz path; would require a specially
  crafted matrix that makes dsteqr diverge.

## Complex number handling

- No direct complex arithmetic in this driver routine. All complex operations are delegated
  to sub-routines (zpbstf, zhbgst, zhbtrd, zsteqr, zstein, zlacpy, zcopy, zgemv, zswap).
- No reinterpret() needed since we only pass Complex128Arrays through to callees.
- CONE/CZERO constructed as module-level Complex128 constants for zgemv alpha/beta.
