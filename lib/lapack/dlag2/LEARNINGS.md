# dlag2: Translation Learnings

## Translation pitfalls

- Fortran SIGN(A, B) used for b11/b22 perturbation: must handle the sign correctly with ternary `(b >= 0.0) ? 1.0 : -1.0` since Math.sign(0) returns 0.
- The routine returns 5 scalar outputs (scale1, scale2, wr1, wr2, wi) via pass-by-reference in Fortran. In JS, these are returned as an object (matching the dlanv2 convention).
- The SAFMIN parameter is passed in (not computed internally like some routines). Callers should pass `require('@stdlib/constants/float64/smallest-normal')`.
- The `no-mixed-operators` lint rule required explicit parentheses around every mixed `+`/`*` and `-`/`*` expression. This is mechanical but affects nearly every arithmetic line.

## Dependency interface surprises

- N/A: dlag2 is a leaf routine with no LAPACK/BLAS dependencies.

## Automation opportunities

- The `stdlib/empty-line-before-comment` rule fires on multi-line `//` comments where continuation lines start with `(`. Merging into a single line avoids this.
- The `stdlib/capitalized-comments` rule treats each `//` line independently, so continuation lines must also start with an uppercase letter. Restructure sentences to avoid mid-sentence line breaks.

## Coverage gaps

- The `|pp*rtmin| >= 1` overflow guard branch (lines 159-160) requires pp ~ 1e154, which needs an extreme A/B eigenvalue ratio after internal scaling. Not triggerable with simple test matrices.
- The `wsize > 1` branch for first eigenvalue scaling is hard to trigger independently from the second eigenvalue path.
- Both are extreme overflow/underflow safety paths that would only activate near IEEE 754 limits.

## Complex number handling

- N/A: dlag2 is a real-valued routine.
