# ztbmv: Translation Learnings

## Translation pitfalls

- The Fortran ztbmv has separate INCX=1 specializations (stride-1 fast paths) that merge trivially in JS since we use the generic stride path for everything. This halved the code size versus a direct transcription.
- The `kx` tracking logic for non-unit strides differs between the no-transpose and transpose branches. In no-transpose upper, `kx` advances when `j >= K`; in transpose upper, `kx` is computed via `kx -= sx` inside the loop. Must follow the Fortran exactly.
- Band storage index formula `l = kplus1 - j` (upper) or `l = -j` (lower) is identical to the real dtbmv. No complex-specific changes needed for the index arithmetic.

## Dependency interface surprises

- No external dependencies required. ztbmv is a leaf routine (no BLAS/LAPACK calls).

## Automation opportunities

- The pattern of complexifying a real band routine (dtbmv -> ztbmv) is very mechanical: add `reinterpret`, double all strides/offsets, expand scalar multiply to complex multiply inline, add conjugate branches. A transform script could handle 90% of this.

## Coverage gaps

- Achieved 100% line, branch, and function coverage. All 12 code paths (2 uplo x 3 trans x 2 diag) tested.

## Complex number handling

- All complex multiplications inlined as `(xr*ar - xi*ai, xr*ai + xi*ar)` -- safe since multiplication does not require numerical stability algorithms.
- Conjugate transpose branches negate `ai` before the multiply: `ai = -Av[ia+1]`.
- No complex division or absolute value needed (this is a multiply routine, not a solve), so no cmplx library imports were required.
- Used `reinterpret()` at function entry to get Float64Array views, with all strides/offsets doubled for Float64 indexing.
