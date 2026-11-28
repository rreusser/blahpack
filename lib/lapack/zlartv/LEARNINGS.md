# zlartv: Translation Learnings

## Translation pitfalls

- The y-vector writes must use the `yv` Float64Array view, not `xv`. Easy to
  copy-paste the x-line and forget to change the target view variable.
- Complex stride/offset convention: strides and offsets are in complex-element
  units at the API boundary, then multiplied by 2 internally for Float64 indexing.
  The real c array does NOT get the *2 treatment.

## Dependency interface surprises

- N/A -- zlartv is a leaf routine with no BLAS/LAPACK dependencies.

## Automation opportunities

- N/A -- straightforward single-loop routine, no repetitive patterns to automate.

## Coverage gaps

- N/A -- 100% line and branch coverage achieved. The routine has only one code
  path (the N <= 0 early return and the main loop), both fully covered.

## Complex number handling

- All complex arithmetic is inlined (real-scalar * complex, complex * complex
  multiply, complex conjugate). No division or absolute value needed, so no
  calls to `cmplx.div` or `cmplx.abs`.
- The `conj(s) * x` operation flips the sign of the imaginary part of s in the
  multiplication formula. Verified against Fortran DCONJG semantics.
- c is a real Float64Array (not complex), so it participates only as a real
  scalar multiplier -- no reinterpret needed for c.
