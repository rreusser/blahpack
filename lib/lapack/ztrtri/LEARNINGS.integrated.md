# ztrtri: Translation Learnings

## Translation pitfalls

- The singularity check for complex matrices must test both real and imaginary parts: `Av[ia] === 0.0 && Av[ia+1] === 0.0`. The real dtrtri only checks `A[idx] === 0.0`.
- The blocked algorithm delegates to ztrmm and ztrsm which take Complex128 scalars. Module-level constants `CONE = (1,0)` and `CNEGONE = (-1,0)` avoid repeated allocation.
- The block size NB=2 (matching dtrtri) provides good test coverage of the blocked path with small matrices (N=5 already exercises multiple blocks).

## Dependency interface surprises

- ztrmm and ztrsm take Complex128 for alpha, not separate real/imag parts. The API is consistent with zgemm.
- ztrti2 is called with the same stride/offset parameters, making the blocked-to-unblocked delegation straightforward.

## Missing automation

- The translation from dtrtri to ztrtri is almost entirely mechanical: replace d-prefix calls with z-prefix, Float64Array with Complex128Array, real scalars with Complex128 constants, and modify the singularity check for complex zero.

## Coverage gaps

- 100% line and branch coverage achieved with 11 tests: upper/lower x non-unit 3x3 and 4x4, upper unit 3x3, singular, identity, upper/lower 5x5 (blocked path), N=0, N=1.

## Complex number handling

- No complex arithmetic is performed directly in ztrtri; all complex operations are delegated to ztrti2, ztrmm, and ztrsm.
- Complex zero check uses Float64Array view of the Complex128Array.
