# zppcon: Translation Learnings

## Routine

ZPPCON estimates the reciprocal of the condition number of a complex Hermitian positive definite matrix stored in packed format, using the Cholesky factorization computed by ZPPTRF.

## Translation pitfalls

- The routine is structurally identical to `zpocon`, but uses `zlatps` (packed) instead of `zlatrs` (full). AP takes stride/offset for a 1D packed array, not two strides for a 2D matrix.
- `izamax` returns a 0-based index in JS, so the `cabs1` index computation must account for this: `(ow + (ix * sw)) * 2`.

## Dependency interface surprises

- `zlatps` expects `normin` as string (`'no'`/`'yes'`), not Fortran-style `'N'`/`'Y'`.
- `zlacn2` uses ISAVE with stride/offset parameters.

## Automation opportunities

- Fortran test fixture for identity and N=1 cases omits the factored AP since `print_array` is not called. Tests for those cases must construct AP inline.

## Coverage gaps

- The overflow bail-out path (`scale < cabs1(...) * SMLNUM || scale === 0.0`) was not exercised by test cases. This would require a near-singular matrix.

## Complex number handling

- CABS1 inlined as `|re(z)| + |im(z)|` using Float64 reinterpretation of Complex128Array.
- No complex arithmetic needed in the main routine body; all complex operations are delegated to deps (zlatps, zlacn2, zdrscl).

## Fortran compilation notes

- deps_zppcon.txt requires `la_constants` and `la_xisnan` for `zlassq` (used by `zlanhp` in the test program).
- Also requires `zladiv` and `dladiv` (transitive deps of `zlatps`).
