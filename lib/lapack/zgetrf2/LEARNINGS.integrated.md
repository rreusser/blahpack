# zgetrf2: Translation Learnings

## Translation pitfalls

- In the N=1 column case, the stride calculation for Float64 indexing requires `ip * sa1 * 2` (sa1 in complex elements, *2 for Float64). Getting this wrong causes pivoting to read wrong elements.
- The `abs(A(1,1))` comparison against sfmin in Fortran uses `ABS()` on a complex value. In JS, used `Math.sqrt(pivR*pivR + pivI*pivI)` for this comparison. Could also use `cmplx.absAt()` but the sqrt approach is fine for a single comparison (not in a hot loop).
- The inverse of the pivot for zscal must be computed with `cmplx.divAt` for numerical stability -- never inline complex division.
- Test matrices must be well-conditioned. An arithmetic-progression matrix (rows linearly dependent) is effectively rank-deficient, causing A22 to be numerically zero. Different rounding in Fortran vs JS leads to different pivot choices in the zero submatrix. Use diagonally dominant matrices for reliable fixture matching.
- `Complex128` constructor is needed for the CONE/CNEGONE constants passed to zgemm and ztrsm.

## Dependency interface surprises

- `izamax` returns a 0-based index (same as `idamax`), consistent with base.js convention.
- `zscal` takes a `Complex128` scalar, NOT separate real/imaginary parts. Had to construct `new Complex128(invR, invI)` for the reciprocal.
- `ztrsm` takes `Complex128` alpha, with strides/offsets in complex elements (same convention as zgemm).
- `zlaswp` takes IPIV as Int32Array with 0-based values, consistent with zgetrf2's output.

## Automation opportunities

- The dgetrf2-to-zgetrf2 translation follows a clear pattern: replace Float64Array with Complex128Array, add reinterpret, multiply stride/offset by 2 in element access, use complex division instead of scalar division. The structure is identical. A "complexify-recursive-LU" transform could be written.

## Coverage gaps

- All code paths covered (100% line and branch coverage), including:
  - M=1 single-row case
  - N=1 column case (both sfmin and normal paths)
  - N=1 singular (zero pivot)
  - General recursive case (3x3, 4x3, 3x4, 4x4)
  - Singular matrix (INFO > 0)
  - M=0 and N=0 quick returns

## Complex number handling

- Used `cmplx.divAt()` for pivot division in the N=1 case (element-wise sfmin path) -- NEVER inline complex division.
- Used `new Complex128(invR, invI)` to construct the reciprocal scalar for zscal.
- CONE and CNEGONE constants constructed as `new Complex128(1,0)` and `new Complex128(-1,0)`.
- The scratch Float64Array for computing 1/pivot is allocated once per N=1 call (not in a hot loop).
