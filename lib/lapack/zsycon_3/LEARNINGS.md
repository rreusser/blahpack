# zsycon_3: Translation Learnings

## Translation pitfalls

- Complex symmetric variant of `dsycon_3` / `zhecon_3`. Same reverse-communication structure.
- Hermitian-vs-symmetric difference: the singular-`D` check must compare both real and imaginary parts to zero — `Av[ia] === 0 && Av[ia+1] === 0`. `zhecon_3` only checks the real part because Hermitian diagonals are real.
- The Fortran source compares `A(I,I) .EQ. CZERO` which Fortran evaluates as full complex equality (both components zero).

## Dependency interface surprises

- `zsytrs_3` has the same calling convention as `zhetrs_3` (an `_3` solver taking `e` for the off-diagonal of `D` plus `IPIV`, with complex-element strides on `A` and `B`).
- `zlacn2` is the same complex 1-norm estimator used by `zhecon_3`.

## Coverage gaps

- Singular-`D` early return covered with synthetic 0+0i diagonal inputs (both upper and lower).
- Added a regression test asserting that a purely imaginary diagonal `0+2i` does NOT trigger the singular branch (catches the easy bug of copy-pasting from `zhecon_3`).

## Process

- Fortran deps file needed `zsytrf_rk`, `zlasyf_rk`, `zsytf2_rk`, `zsyr` (called by `zsytf2_rk`), `zlansy`, `dlapy2`, `disnan`, `dlaisnan`, `zlacgv` plus `la_constants` / `la_xisnan` modules.
