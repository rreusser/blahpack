# zhptrs: Translation Learnings

## Translation pitfalls

- Packed storage index tracking (KC) requires careful 0-based conversion. The Fortran code uses a top-of-loop KC decrement pattern, while the JS version merges decrements into the branch bodies, requiring different formulas for 1x1 vs 2x2 pivot blocks.
- In the lower phase 2 (back-substitution), the AP offset for the k-1 row in a 2x2 pivot block must be `kc - N + k + 1`, not `kc - N + k`. The off-by-one arises from converting `AP(KC-(N-K))` (Fortran 1-based) to 0-based indexing.
- The KC decrement for the 2x2 block in lower phase 2 must skip two full columns: `2*N - 2*k + 3`, not `2*N - 2*k + 1`.

## Dependency interface surprises

- IPIV uses the 0-based bitwise NOT convention: negative values encode 2x2 pivots via `~kp` where `kp` is the 0-based swap target. Read back with `~IPIV[k]`.
- zlacgv conjugates a row of B in-place; it's called in matched pairs (conjugate, zgemv, unconjugate) in phase 2.
- zdscal scales by a real scalar; the diagonal of a Hermitian matrix is always real.

## Automation opportunities

- The Fortran-to-JS packed index conversion for KC tracking could be formalized into a reusable pattern, since zhptrf/zhptrs/dsptrs all use the same packed storage traversal.

## Coverage gaps

- Branch coverage for swap-when-kp-differs-from-k is not hit when fixtures happen to have trivial pivots. More diverse test matrices would improve coverage.

## Complex number handling

- Complex division uses the Smith algorithm (cDiv helper with module-level cdR/cdI) to avoid overflow.
- Hermitian diagonal elements are always real, so `AP[diagonal]` imaginary part is zero and only the real part is used for scaling.
- Conjugate of AKM1K is formed by negating the imaginary part inline (no library call needed).
