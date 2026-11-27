# zlansp: Translation Learnings

## Translation pitfalls

- The Fortran `ABS(AP(I))` for `COMPLEX*16` computes the complex modulus `sqrt(re^2 + im^2)`, not CABS1 (`|re| + |im|`). This is important -- zlansp (symmetric) uses full complex modulus everywhere, unlike zlanhp (Hermitian) which uses CABS1 for max/one/inf norms.
- The Frobenius norm diagonal handling splits real and imaginary parts of each diagonal element and adds them to the scaled sum separately (matching the Fortran `DBLE(AP(K))` and `DIMAG(AP(K))` treatment). This is because `zlassq` handles the off-diagonal elements as full complex numbers, but the diagonal elements need special treatment since they appear once (not twice via symmetry).
- Packed storage indexing: for upper packed, diagonal of column j is at cumulative position `j*(j+1)/2 + j`; walking with stride `k += i + 2` (upper) or `k += N - i` (lower) is cleaner.

## Dependency interface surprises

- `zlassq` takes Complex128Array with strides/offsets in complex elements (not Float64 indices). The `reinterpret` call is internal to zlassq. This differs from how base.js itself uses `reinterpret` for direct element access.
- The deps file needed `la_xisnan` and `dlamch` for Fortran compilation that were not in the auto-generated deps list. Similar to other routines, `zlassq.f90` uses Fortran modules that require these transitive dependencies.

## Automation opportunities

- None identified beyond existing tooling.

## Coverage gaps

- Unknown norm string returns 0.0 (matches Fortran behavior). Not tested via fixtures but is a simple fallthrough.

## Complex number handling

- All element absolute values use `Math.sqrt((re * re) + (im * im))` (complex modulus), inlined rather than using a library call.
- `reinterpret` from `@stdlib/strided/base/reinterpret-complex128` provides the Float64Array view for direct re/im access.
- Strides and offsets in the signature are in complex elements; internally multiplied by 2 for Float64 indexing (`sap = strideAP * 2`, `oap = offsetAP * 2`).
