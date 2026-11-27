# dgghrd: Translation Learnings

## Translation pitfalls

- The Fortran uses 1-based ILO/IHI directly in loop bounds and array indexing.
  JS base.js keeps ILO/IHI as 1-based parameters (matching the Fortran API
  convention) and converts to 0-based loop variables: `jcol = ilo - 1` to
  `jcol <= ihi - 3`. The drot count arguments like `N+2-JROW` (1-based) become
  `N+1-jrow` (0-based).
- The `dlartg(f, g, out)` interface writes `out[0]=c, out[1]=s, out[2]=r`.
  This differs from the complex `zlartg` which takes separate Complex128Array
  arguments for each output. The real version is simpler.
- Relative path from `lib/lapack/base/dgghrd/lib/base.js` to drot is
  `../../../../blas/base/drot/lib/base.js` (4 levels up), not 3.

## Dependency interface surprises

- `dlartg` takes two scalars f and g (not arrays) and writes c, s, r into a
  single Float64Array output. No array+offset interface for inputs.
- `drot` uses `(N, x, strideX, offsetX, y, strideY, offsetY, c, s)` where
  c and s are plain scalars (not arrays).
- No dependency calling convention surprises worth adding to
  docs/dependency-conventions.md.

## Automation opportunities

- The Fortran test compilation requires la_constants.f90 to be compiled first
  (module dependency). The run_fortran.sh script does not handle .f90 module
  ordering. Currently worked around by manually compiling la_constants first
  from the build directory.

## Coverage gaps

- 100% line and branch coverage on base.js achieved. All paths covered
  including: initialize/update/none for both COMPQ and COMPZ, N<=1 quick
  return, ILO=IHI edge case, IHI=ILO-1 empty range, invalid parameter
  returns, and the full reduction loop.

## Complex number handling

- N/A: dgghrd is a real-valued routine. No complex arithmetic needed.
