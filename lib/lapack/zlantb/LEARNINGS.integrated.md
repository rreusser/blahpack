# zlantb: Translation Learnings

## Translation pitfalls

- Band storage indexing requires careful Fortran-to-JS index mapping. The Fortran
  loops iterate over band row indices (1-indexed), not original matrix row indices.
  Upper: band row K is the diagonal (0-indexed); Lower: band row 0 is the diagonal.
- Fortran `AB(LDAB, *)` declares the shape the callee sees. If the caller's array
  has a different leading dimension than LDAB, Fortran silently reinterprets the
  memory. The initial Fortran test used a single `ab(4, 5)` array with LDAB=1 for
  the K=0 edge case, causing the test to read garbage because column stride was 4
  (the declared first dimension), not 1. Fixed by using separate arrays with matching
  first dimensions (`ab1(1, 3)`, `ab2(2, 3)`, `ab3(3, 4)`).
- The infinity-norm section uses a clever Fortran trick: it maps original matrix
  indices through `L = K+1-J` (upper) or `L = 1-J` (lower) to compute band row
  indices. In JS this becomes `l = K - j` or `l = -j` (0-indexed).

## Dependency interface surprises

- `zlassq` returns `{ scl, sumsq }` (not positional), which is clean for chaining
  across columns.
- `zlassq` operates on Complex128Array with strides/offsets in complex elements,
  not Float64 elements. This matches the band storage strides directly.
- `cmplx.absAt` operates on Float64Array views at Float64 indices (not complex
  indices), so all max/one-norm/inf-norm loops must work in doubled strides.

## Automation opportunities

- The Fortran test scaffolding should enforce that array dimensions match LDAB.
  A lint check could verify that declared array dimensions in test_*.f90 files
  match the LDAB passed to band matrix routines.

## Coverage gaps

- K > N is technically valid (band wider than matrix) but not explicitly tested.
  The code handles it correctly via the min/max bounds.
- NaN propagation (DISNAN) is tested implicitly through maxNaN helper.

## Complex number handling

- Uses `cmplx.absAt` for element-wise absolute value (overflow-safe complex modulus).
- Uses `zlassq` for Frobenius norm, which processes both real and imaginary parts
  of each complex element internally via Blue's scaling constants.
- No complex arithmetic is needed beyond absolute value; all norms reduce to real
  operations on |z| values.
