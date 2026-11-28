# zsycon: Translation Learnings

## Translation pitfalls

- Complex zero check on diagonal requires checking both real and imaginary parts via reinterpret view. Fortran `A(I,I).EQ.ZERO` with complex ZERO=(0,0) checks both components; in JS, must check `Av[ia] === 0.0 && Av[ia+1] === 0.0`.
- Nearly identical to dsycon; the only structural differences are Complex128Array types and using zlacn2 instead of dlacn2 (no IWORK/ISGN needed for zlacn2).

## Dependency interface surprises

- zlacn2 does not take an ISGN array (unlike dlacn2 which takes ISGN as Int32Array). zlacn2's signature is simpler: `(N, V, strideV, offsetV, X, strideX, offsetX, EST, KASE, ISAVE, strideISAVE, offsetISAVE)`.
- zsytrs uses long-form strings ('upper'/'lower'), matching the convention used in zsytrf.

## Automation opportunities

- The zsycon/dsycon pattern (lacn2 + xsytrs reverse-communication loop) is identical across real/complex variants. Could be a template.

## Coverage gaps

- 98.68% line coverage, 89.47% branch. The uncovered lines (106-107) are the lower-triangle diagonal zero check for 2x2 pivots, which requires constructing a specific factorization that produces 2x2 pivots in the lower triangle with a zero diagonal block. Hard to trigger with simple test matrices.

## Complex number handling

- No complex arithmetic is performed directly in zsycon. All complex operations are delegated to zlacn2 and zsytrs. The only complex-aware code is the diagonal zero check via reinterpret.
