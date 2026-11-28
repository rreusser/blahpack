# zhbgv: Translation Learnings

## Translation pitfalls

- This is a driver routine that delegates to zpbstf, zhbgst, zhbtrd, dsterf/zsteqr. The main challenge is correctly partitioning the RWORK array: e (off-diagonal elements) lives at RWORK[0..N-1] and scratch workspace at RWORK[N..2N-1].
- The Fortran JOBZ='V' maps to `'compute-vectors'` at the zhbgv level, but sub-routines use different conventions: zhbgst/zhbtrd use `'update'`/`'none'` for VECT, and zsteqr uses `'update'` for COMPZ.

## Dependency interface surprises

- zhbgst takes both a complex WORK array and a real RWORK array. The RWORK passed to zhbgst starts at `indwrk` (offset N into the RWORK buffer), not at the beginning.
- zhbtrd outputs real diagonal (d) and off-diagonal (e) arrays. The diagonal goes into W (eigenvalues) and the off-diagonal goes into RWORK at offset inde.
- zsteqr's WORK parameter is a real Float64Array (not complex), which is shared with the RWORK buffer.

## Automation opportunities

- The pattern of complex driver routines (z-prefix) wrapping the same sub-routine sequence as their real counterparts (d-prefix) but with separate WORK/RWORK is highly templatable. zhbgv mirrors dsbgv almost exactly.

## Coverage gaps

- All major paths covered: N=0 quick return, eigenvalues-only (dsterf path), eigenvalues+eigenvectors (zsteqr path), upper/lower storage, diagonal matrices (KA=KB=0), N=1 trivial, and larger N=8 cases.

## Complex number handling

- zhbgv itself does not perform any complex arithmetic -- it delegates entirely to sub-routines. AB, BB, Z, and WORK are Complex128Array, while W and RWORK are Float64Array.
