# zgbequ: Translation Learnings

## Translation pitfalls

- Band storage indexing: the Fortran 1-based index `KD + I - J` where `KD = KU + 1`
  maps to 0-based `ku + i - j` in JavaScript. The reinterpret Float64 view doubles
  all complex strides (`sa1 = strideAB1 * 2`, `sa2 = strideAB2 * 2`).
- CABS1(z) = |Re(z)| + |Im(z)| accesses the Float64 view at pairs: `v[idx]` for
  real, `v[idx+1]` for imag. Must compute idx correctly as
  `oAB + (kd+i-j)*sa1 + j*sa2`.

## Dependency interface surprises

- No external dependencies beyond dlamch (safe-minimum) and reinterpret-complex128.
- The routine returns scalar outputs (rowcnd, colcnd, amax, info) via an object,
  not via mutable output arrays, matching the dgeequ/zpoequ convention.

## Automation opportunities

- The codemod properly reformats Complex128Array literals in tests to one-value-per-line,
  but this inflates test files beyond the 300-line max-lines limit, requiring an
  eslint-disable for max-lines.

## Coverage gaps

- All major code paths covered: quick return (M=0, N=0), zero row, zero column,
  diagonal-only band, non-square matrix, and well-conditioned cases.

## Complex number handling

- CABS1 inlined as `Math.abs(v[idx]) + Math.abs(v[idx+1])` on the Float64 view,
  matching the Fortran statement function. No complex arithmetic library needed.
