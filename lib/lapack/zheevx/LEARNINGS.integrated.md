# zheevx: Translation Learnings

## Translation pitfalls

- The M parameter is an output in Fortran (number of eigenvalues found). In JS we pass it via an `out` object (`out.M`) since JS cannot pass integers by reference. This pattern differs from most other routines where INFO is the only "out" parameter.
- The fast path (all eigenvalues, abstol<=0) uses zsteqr+zungtr (same as zheev). The selective path uses dstebz+zstein+zunmtr. Both paths must be fully implemented.
- dstebz uses long-form strings: 'all'/'value'/'index' for range and 'block'/'entire' for order. The Fortran uses single chars 'A'/'V'/'I' and 'B'/'E'.
- The sorting section (eigenvalues + eigenvectors) only applies when wantz=true AND the dstebz path was used. The fast path (zsteqr) already returns sorted eigenvalues.

## Dependency interface surprises

- dstebz takes M and nsplit as Int32Array references (M[0], nsplit[0]) since they are output parameters. This is unlike most LAPACK routines.
- zstein requires IBLOCK/ISPLIT from dstebz, which use 1-based block indices. This is preserved as-is since both routines agree on the convention.
- zunmtr is a thin wrapper that dispatches to zunmql (upper) or zunmqr (lower). It adjusts offsets into A to skip the diagonal where reflectors are stored.
- zswap takes Complex128Array with strides/offsets in complex elements.

## Automation opportunities

- The 8 missing transitive deps (dlaruv, dlarnv, dlagtf, dlagts, zunm2l, zunmql, zunmtr, zstein) were needed. The init_routine.py tool only generates direct deps, not transitive ones. A recursive dep scaffolding command would help.

## Coverage gaps

- Scaling paths (iscale=1) are uncovered because test matrices have norms in the safe range. Testing with 1e-300 or 1e+300 matrix entries would cover these.
- The "fast path failed, fall through to dstebz" branch (info != 0 from zsteqr/dsterf) is hard to trigger with well-conditioned matrices.
- IFAIL swap path (info != 0 during selective eigenvector computation) requires a non-converging inverse iteration case.

## Complex number handling

- zheevx itself does minimal complex arithmetic - it delegates to zhetrd, zungtr, zsteqr, zstein, zunmtr. The only direct complex ops are zdscal for scaling and zswap for sorting eigenvector columns.
- The N=1 case directly reads the real part of A(0,0) via reinterpret() and sets Z(0,0) = 1+0i.
