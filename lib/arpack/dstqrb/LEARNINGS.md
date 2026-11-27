# dstqrb: Translation Learnings

## Translation pitfalls

-   **dstqrb is LAPACK's `dsteqr` with `icompz = 2` hardwired and Z reduced to
    the last row.** The existing `lib/lapack/base/dsteqr` is the structural
    template; only the Z handling changes: Z is a length-N vector initialized
    to `[0,...,0,1]`, the 2x2 blocks rotate `z[l],z[l+1]` (QL) / `z[l-1],z[l]`
    (QR) inline instead of via `dlasr`, the bulge-chase `dlasr` calls act on a
    single row (M=1), and the final selection sort does a scalar swap of two
    z-entries.
-   **Signed zero in `SIGN(r, g)` (the important one).** The Wilkinson shift
    forms `g = (d[l+1]-p) / (2*e[l])`; on a symmetric matrix this can be
    `+0.0 / -2.0 = -0.0`. gfortran's `SIGN(r, -0.0)` returns `-r`, so a naive
    `g >= 0 ? r : -r` (which treats `-0.0 >= 0` as true in JS) flips the whole
    eigenvector row. The fixture caught this. Use
    `( g < 0.0 || Object.is( g, -0 ) ) ? -r : r`, which reproduces Fortran's
    signed-zero behavior for `+0`, `-0`, and nonzero `g` alike.
-   `icompz` is kept as a local constant `2` (matching the Fortran) so the
    `icompz > 0` guards and the vestigial `icompz === 0` branches read the same
    as `dstqrb.f`; the dead branches keep `dlae2`/`dlasrt` referenced.

## Dependency interface surprises

-   The Fortran fixture build needed transitive deps of the modern LAPACK
    `dlartg.f90`/`dlascl`/`dlassq.f90`: `disnan`, `dlaisnan`, `dlassq`, plus the
    Fortran **modules** `la_constants` and `la_xisnan` — which must be listed
    *before* their users in `deps_dstqrb.txt` so gfortran generates the `.mod`
    files first. `run_fortran.sh` now also searches `.f90`/`.F90`/`.F`.
