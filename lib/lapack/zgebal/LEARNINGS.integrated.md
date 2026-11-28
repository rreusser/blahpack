# zgebal: Translation Learnings

## Translation pitfalls

- zgebal is nearly identical to dgebal, differing only in array types and BLAS calls. The dgebal implementation served as a direct template.
- The Fortran zero-check for complex uses `DBLE(A(I,J)).NE.ZERO .OR. DIMAG(A(I,J)).NE.ZERO` rather than a single `A(I,J).NE.ZERO`. In JS, this translates to checking both Float64 view elements (re and im) against 0.0.
- Complex strides require the "times 2" conversion: `strideA1 * 2` for Float64 indexing vs `strideA1` for complex-element indexing. The BLAS routines (zswap, zdscal, dznrm2, izamax) all expect complex-element strides and do their own *2 internally.
- The `ABS()` intrinsic in Fortran on complex values returns `sqrt(re^2+im^2)` (the modulus), not `|re|+|im|` (dcabs1). Used `Math.sqrt(re*re+im*im)` for CA and RA accordingly.

## Dependency interface surprises

- All complex BLAS routines (zswap, zdscal, dznrm2, izamax) take strides and offsets in complex elements, not Float64 indices. They internally call `reinterpret()` and multiply by 2. This is consistent but must be remembered when computing the offsets to pass.
- izamax returns a 0-based index (in complex elements), consistent with idamax in the JS codebase.
- SCALE is a real (Float64Array) array, not complex, matching the Fortran DOUBLE PRECISION declaration. This is unlike A which is Complex128Array.

## Automation opportunities

- The translation from dgebal to zgebal was almost entirely mechanical: replace dswap->zswap, dscal->zdscal, dnrm2->dznrm2, idamax->izamax, add reinterpret() for zero checks, change ABS to complex modulus. A "real-to-complex" transform could automate this for gebal-like routines.
- The Fortran test was also mechanical: same structure as dgebal but with complex literals and EQUIVALENCE for printing. Could be automated with a template.

## Coverage gaps

- NaN guard branch (line ~236-237 in base.js) is not covered -- would require injecting NaN into the matrix to trigger.
- Safety guards for extreme scaling (SFMIN1/SFMAX1 checks, lines ~274-280) are not covered -- would require inputs near underflow/overflow thresholds.
- Both are standard hard-to-cover paths; coverage is 95.67% line / 90.20% branch, well above thresholds.

## Complex number handling

- No complex arithmetic (mul, div, abs) was needed beyond zero checks and modulus computation for CA/RA.
- Zero checks are done by reading both Float64 components directly from the reinterpreted view.
- Complex modulus (`sqrt(re^2+im^2)`) was inlined for CA/RA since it is safe to inline (no numerical stability concerns unlike division).
- zdscal handles the real-scalar-times-complex-vector scaling, so no manual complex scaling was needed.
