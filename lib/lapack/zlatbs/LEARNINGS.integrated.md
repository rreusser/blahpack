# zlatbs: Translation Learnings

## Translation pitfalls

- Banded storage LDAB dimension mismatch: Fortran tests that declare AB(KDMAX+1, NMAX) but call with kd < KDMAX must pass LDAB=KDMAX+1 (the declared leading dim), NOT kd+1. Passing kd+1 when the array has a larger leading dim causes column misalignment. Fixed by using kd=KDMAX in all tests.
- The `maind` diagonal row index in banded storage is `kd` for upper and `0` for lower (0-based). This is the key difference from zlatrs (dense storage).
- CABS2 helper needed in addition to CABS1: uses half-scaling to avoid overflow in initial xmax computation.
- Fortran DCMPLX(ONE) comparison for uscal translates to checking both re and im parts.

## Dependency interface surprises

- ztbsv uses long-form strings ('upper', 'no-transpose', etc.) matching the same convention as ztrsv.
- zdotc/zdotu return Complex128 objects; must extract real/imag parts with `real()` and `imag()`.
- zladiv takes Float64Array scratch inputs, not Complex128 — same pattern as zlatrs.

## Missing automation

- N/A: zlatbs is structurally similar to zlatrs but different enough (banded indexing) that automation would be complex.

## Coverage gaps

- The careful-solve path with scaling (grow*tscal <= SMLNUM) is only tested indirectly through the singular test case. Near-overflow/underflow scaling paths are not exercised.
- The CNORM overflow rescaling path (tscal != 1) is not tested.

## Complex number handling

- Conjugate transpose branch conjugates AB elements when computing tjjs and inline dot products, matching Fortran's DCONJG pattern.
- Complex division always uses zladiv (never inlined).
