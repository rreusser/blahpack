# zhpr2: Translation Learnings

## Translation pitfalls

- The packed storage index arithmetic is simpler than full matrix storage
  (no strideA1/strideA2), but kk advancement differs between upper
  (`kk += (j+1)*sap`) and lower (`kk += (N-j)*sap`). Matching the
  Fortran exactly avoids off-by-one errors.
- The else branch (x[j]==0 and y[j]==0) in upper triangle needs a
  computed diagonal position (`kk + j*sap`), whereas in lower triangle
  the diagonal is always at `kk` (start of the column block). This
  asymmetry is easy to miss.
- The no-mixed-operators lint rule catches `kk + j * sap` which needs
  explicit parentheses: `kk + (j * sap)`. This is a mechanical fix.

## Dependency interface surprises

- N/A — zhpr2 has no BLAS/LAPACK dependencies beyond Complex128/reinterpret.

## Automation opportunities

- N/A — the scaffold generator handled all boilerplate correctly.

## Coverage gaps

- None. 100% line, branch, and function coverage achieved. All branches
  including the "both x[j] and y[j] zero" else paths for both upper and
  lower triangles are covered.

## Complex number handling

- Used the same pattern as zher2: `reinterpret()` at function entry to
  get Float64Array views, multiply strides/offsets by 2 for double-based
  indexing. Complex scalar alpha extracted via `real()`/`imag()`.
- `temp1 = alpha * conj(y[j])` and `temp2 = conj(alpha * x[j])` are
  inlined as real/imag arithmetic (safe — no division involved).
- Diagonal elements forced real by zeroing imaginary part, matching
  the Fortran `DBLE()` calls.
