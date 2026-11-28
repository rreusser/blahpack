# zla_heamv: Translation Learnings

## Translation pitfalls

- `zla_heamv` and `zla_syamv` are computationally identical because `CABS1(conj(z)) == CABS1(z)`.
  The only difference between the Fortran sources is the routine name and comments.
- Scaffolded benchmarks allocated `N*N` for x and y (should be `N`), and used `Float64Array`
  instead of `Complex128Array` for A and x.
- All files containing `zla_heamv` as a JS identifier need `camelcase` in their eslint-disable.

## Complex number handling

- A and X are complex (`Complex128Array`), Y is real (`Float64Array`).
- Complex strides/offsets are converted to Float64 by multiplying by 2 inside base.js.
- `CABS1(ZDUM) = |Re(z)| + |Im(z)|` implemented as `Math.abs(v[idx]) + Math.abs(v[idx+1])`
  on the reinterpreted Float64 view. Used for both matrix elements and vector elements.
- The `SYMB_ZERO` check tests complex zero by checking both real and imaginary parts:
  `xv[jx] === 0.0 && xv[jx+1] === 0.0`.
- Diagonal of a Hermitian matrix has zero imaginary part by definition, so CABS1 naturally
  gives `|Re(A_ii)|`. No special-casing needed (matches Fortran behavior).
- `SIGN(SAFE1, Y(IY))` perturbation maps to `(yiy >= 0.0) ? safe1 : -safe1`.
- SAFMIN is hoisted as a module-level constant since it never changes.
