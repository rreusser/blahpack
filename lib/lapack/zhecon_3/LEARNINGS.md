# zhecon_3: Translation Learnings

## Translation pitfalls

- Hermitian variant of `dsycon_3`. Same reverse-communication structure: `zlacn2` loop with `zhetrs_3` solve between iterations.
- Hermitian diagonal is real, so the singular-`D` check tests only the real part: `Av[ p1 ] === 0.0` where `p1 = (offsetA*2) + i*sa1 + i*sa2`. (`zsycon_3` needs both real and imag parts.)
- `zlacn2` lacks the `ISGN` parameter that `dlacn2` has. The complex variant has 12 args vs 15 for the real one.

## Dependency interface surprises

- `zlacn2` argument order: `(N, V, sV, oV, X, sX, oX, EST, KASE, ISAVE, sISAVE, oISAVE)` — no `ISGN` and no `IWORK`. Pass `WORK` twice with offset `0` for `X` and `N*sw` for `V` (complex-element strides).
- `zhetrs_3` is the `_3` variant taking the `e` (super-/sub-diagonal of `D`) array in addition to `A` and `IPIV`. It uses complex-element strides (`strideA1`, `strideA2`).
- `Complex128Array.buffer` is the underlying `ArrayBuffer`; wrapping a `Float64Array` (from a JSON fixture) as a `Complex128Array` is `new Complex128Array( float64.buffer )`.

## Coverage gaps

- `anorm <= 0` and singular-`D` early returns covered with synthetic inputs; the real-prefix factorization rarely produces `IPIV[i] >= 0 && D[i,i] == 0`.

## Process

- Fortran deps file needed `zhetrf_rk`, `zlahef_rk`, `zhetf2_rk`, `zlacgv`, `dlapy2`, `disnan`, `dlaisnan` in addition to the JS-detected deps. `deps.py` does not pick these up because they are reachable only through the factorization chain.
- Fortran test stores `A` in an `NMAX x NMAX` static matrix but always calls with `n <= NMAX`. Print `2 * NMAX * n` doubles via `EQUIVALENCE` and pass `lda = NMAX` into the JS test so `strideA2 = lda`.
