# dpbcon: Translation Learnings

## Translation pitfalls

- dpbcon is structurally identical to dpocon but uses dlatbs instead of dlatrs. The AB storage is the dpbtrf Cholesky factor in banded format (KD+1 rows).
- For upper: `A = U^T * U`, solve order is U^T first (transpose), then U (no-transpose). For lower: `A = L * L^T`, solve order is L first (no-transpose), then L^T (transpose). Getting the order wrong silently produces incorrect rcond.
- Unlike dgbcon, dpbcon has no IPIV/pivot handling since Cholesky factorization does not pivot.

## Dependency interface surprises

- dlatbs with the Cholesky factor bandwidth KD works directly -- no offset adjustment needed since dpbtrf stores the factor in the same KD+1 row banded format.
- The upper and lower tests produce identical rcond values because the underlying SPD matrix is the same -- this is a good sanity check.

## Automation opportunities

- dpbcon and dpocon share the same dlacn2 reverse-communication pattern, differing only in dlatbs vs dlatrs calls. A shared template could generate both.

## Coverage gaps

- Lines 144-151 (the scale overflow bailout) are uncovered, which is expected for well-conditioned SPD matrices.
- 95.18% line coverage, 92.86% branch coverage -- exceeds targets.

## Complex number handling

- N/A: dpbcon is a real-valued routine.
