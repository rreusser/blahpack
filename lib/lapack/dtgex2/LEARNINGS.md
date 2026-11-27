# dtgex2: Translation Learnings

## Translation pitfalls

- **Critical 1-based to 0-based index mismatch in DROT counts**: The Fortran
  code uses `DROT(J1+1, ...)` where J1 is 1-based. In 0-based JS with
  `j1 = J1_fortran - 1`, the count must be `j1 + 2`, not `j1 + 1`. This is
  because `J1+1` in 1-based = `(j1+1)+1 = j1+2` in 0-based. Similarly
  `N-J1+1` becomes `N-j1` since `J1 = j1+1`.

- **Helper function split**: The routine has two distinct code paths (m=2 for
  1x1 swap, m>2 for general case). The general case was split into a helper
  function `dtgex2General` to manage complexity and avoid unused variable
  warnings from ESLint.

- **dlartg output mapping**: Fortran `CALL DLARTG(F, G, IR(1,2), IR(1,1), DDUM)`
  puts C (cosine) into IR(1,2) and S (sine) into IR(1,1). The JS dlartg returns
  `out[0]=c, out[1]=s, out[2]=r`, so the mapping is `ir[LDST]=out[0]` and
  `ir[0]=out[1]`.

## Dependency interface surprises

- **dlassq returns an object**: `dlassq(N, x, stride, offset, scale, sumsq)`
  returns `{ scl, sumsq }` rather than modifying scalar arguments in place.

- **dlagv2 returns an object**: Returns `{ CSL, SNL, CSR, SNR }` for the
  rotation parameters, which need to be unpacked into the appropriate array
  positions and workspace entries.

- **dtgsy2 scalar parameters**: `scale`, `rdsum`, `rdscal` are Float64Array
  arguments (modified in place via `[0]`), and `pq` is an Int32Array.

- **BLAS vs LAPACK require paths**: dgemm, drot, dscal are in
  `../../../../blas/base/` not `../../`.

## Fortran test compilation

- dtgex2 has deep transitive Fortran dependencies (dlassq needs la_constants
  and la_xisnan modules, dtgsy2 needs dgetc2/dgesc2/dlatdf which need
  dlaswp/dgecon/dlacn2/dlatrs/dlange). The deps file required ~30 entries.
