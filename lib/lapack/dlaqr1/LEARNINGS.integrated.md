# dlaqr1: Translation Learnings

## Translation pitfalls

- No index off-by-one issues: this routine has no loops and no 1-based loop variables. All array access is explicit element-by-element, so translation was direct.
- The scaling variable `s` prevents overflow. Fortran divides by `s` before multiplying; the operation order must be preserved exactly (do not simplify algebraically, e.g., do not combine `(H(1,1)-sr2)/s` with `(H(1,1)-sr1)` before the division).
- The `s === 0` branch must set ALL output elements to zero (not just return early), since `v` may contain garbage on entry.

## Dependency interface surprises

- N/A: dlaqr1 is a leaf routine with no external BLAS/LAPACK dependencies. Only uses `Math.abs`.

## Automation opportunities

- N/A: this is a small, self-contained routine. The existing scaffold + fixture pipeline handled it well.

## Coverage gaps

- 100% line, branch, and function coverage achieved.
- The Fortran test covers both N=2 and N=3 code paths, both the `s===0` branch and the normal computation branch, and the quick-return path (N not 2 or 3).

## Complex number handling

- N/A: dlaqr1 is a real (double precision) routine. The complex shift components (si1, si2) are real scalars representing imaginary parts, handled with standard real arithmetic.
