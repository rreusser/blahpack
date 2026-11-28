# zsptri: Translation Learnings

## Translation pitfalls

- The 2x2 pivot block inversion uses complex arithmetic throughout. Unlike
  `dsptri` (real), `t` is a complex number (not `abs(t)`), and `ak`, `akp1`,
  `d` are all complex. Unlike `zhptri` (Hermitian), the diagonal elements are
  fully complex (not forced real), so updates must modify both real and imaginary
  parts.
- The singularity check must test both real and imaginary parts of the diagonal
  being zero, not just the real part.
- IPIV convention: 0-based, negative values encode 2x2 pivot blocks via bitwise
  NOT (`~p`). Convert to 1-based for internal Fortran-style indexing.

## Dependency interface surprises

- `zspmv` (symmetric packed matvec) takes `Complex128` scalars for alpha/beta,
  matching the `zhpmv` interface. The function handles the symmetric (no
  conjugation) semantics internally.
- `zdotu` (unconjugated dot product) returns a `Complex128` object. Both real
  and imaginary parts must be subtracted from the diagonal update (unlike
  `zhptri` which only subtracts `real(zdotc(...))`).

## Automation opportunities

- The linter's variable declaration reordering destroyed helper functions that
  used `var x = expr` initializers depending on previously declared variables.
  Solution: avoid multi-line `var` blocks with dependent initializers in helper
  functions. Inline the 2x2 inversion logic or use only bare `var x;`
  declarations with separate assignment statements.

## Coverage gaps

- Upper pivot swap loop (rows kp+1..k-1) at ~97% coverage -- requires
  non-adjacent row swaps which need larger matrices or specific pivot patterns.
- Smith's formula alternate branch in `cdiv` (~line 551) for `|bi| > |br|` --
  depends on specific complex number magnitudes.

## Complex number handling

- `invertAt`: inline Smith's formula for complex reciprocal. Avoids allocating
  a Complex128 object.
- `cdiv`: returns a two-element plain array `[real, imag]` rather than using
  module-level scratch variables (which the linter could reorder). Using a plain
  array avoids the linter reordering problem while keeping allocation minimal
  (small arrays are cheap).
- Key difference from `zhptri`: NO conjugation anywhere. Swaps are plain swaps
  (no negating imaginary parts). Diagonal updates subtract both real and
  imaginary parts of the dot product, not just the real part.
- `AKKP1 / T` always equals `1+0i` since `T = AP(kcnext+k-1) = AKKP1`, so
  the division is optimized away.
