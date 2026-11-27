# zla_lin_berr: Translation Learnings

## Translation pitfalls

- The Fortran `RES` and `AYB` are declared as `(N, NRHS)` but the
  routine has no LDA parameter and iterates them as if contiguous
  column-major. The stdlib-js signature generator produced a single
  stride per matrix; I treated it as a strided 1D view over `N*NRHS`
  elements where element `(i, j)` sits at linear index `i + j*N`
  scaled by the supplied stride. For the common case of contiguous
  storage with `strideX == 1`, this matches Fortran's layout exactly.
- `CABS1(z) = |Re(z)| + |Im(z)|` is LAPACK's fast 1-norm modulus used
  for error bounds and is NOT the true complex modulus. Inlined via
  two `Math.abs`-equivalent branches on the Float64 view — do NOT use
  `Math.hypot` or `cmplx.abs`.
- A guard term `(nz+1)*safmin` is added to the numerator to avoid a
  spuriously zero backward error; entries where `AYB(i,j) == 0.0` are
  skipped entirely because the reference AYB computation would only
  produce an exact zero when the true residual is also zero.

## Dependency interface surprises

- `dlamch('S')` is replaced with
  `require('@stdlib/constants/float64/smallest-normal')` per the
  skill's Fortran-idiom table. Hoisted to module scope.
- `reinterpret-complex128` requires the Float64 view length to be
  even; if the wrapper test passes a `Float64Array(4)` for the
  complex `res` argument (as the scaffolded test did), `reinterpret`
  will happily produce a 2-element `Complex128Array` view — the
  scaffold test must pass a real `Complex128Array` or the test
  becomes meaningless.

## Complex number handling

- `res` is reinterpreted to a Float64 view once at the top of the
  loop: `sRx2 = strideRES * 2`, `oRx2 = offsetRES * 2`. Each row
  advance adds `sRx2` to the Float64 index; `[iR]` and `[iR+1]`
  give real and imaginary parts.
- CABS1 was inlined as two small branches (`if (re < 0) re = -re;`)
  rather than calling `Math.abs` twice — matches the style used
  elsewhere in the codebase and avoids extra function dispatch in a
  hot loop.

## Scaffold / tooling friction

- The scaffold generates snake_case JS identifiers (`zla_lin_berr`)
  matching the file name, but stdlib ESLint's `camelcase` rule rejects
  them. Renamed the internal binding to `zlaLinBerr` in every `.js`
  file while keeping file names (`zla_lin_berr.js`) snake_case. The
  `require()` specifiers still point at the snake_case files.
- `bin/codemod-tests.js` rule 3d inserts TWO blank lines before every
  `// SECTION //` header, but `stdlib/section-header-empty-lines`
  demands only ONE blank line after `'use strict';`. Running
  `bin/lint-fix.sh` on `test/test.js` ping-pongs between the two —
  had to manually correct by editing after running the codemod.
- The signature generator does not emit separate `stride1`/`stride2`
  for matrix arguments when the Fortran source has no LDA parameter.
  Future improvement: detect `dimension(N, NRHS)` without LDA and
  emit a matching 2D stride pair, or document the convention that
  such arguments are strided 1D views over `N*NRHS` in column-major
  order.
- Scaffolded `benchmark/benchmark.{js,ndarray.js}` allocates with
  only `N` elements and passes `Float64Array` for a complex argument.
  Rewrote both to build a `Complex128Array` of `N*NRHS` entries and
  capped `max` at `10^4` to avoid the N*N OOM trap documented in
  project memory.
