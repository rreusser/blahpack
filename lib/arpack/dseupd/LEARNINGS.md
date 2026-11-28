# dseupd: Translation Learnings

## Translation pitfalls

-   **1-based WORKL pointer arithmetic everywhere.** `dseupd` lays out its
    scratch inside `workl` using 1-based ARPACK pointers (`ih`, `bounds`,
    `ihd`, `ihb`, `iq`, `iw`, `irz`, `ibd`). Every `workl(p)` access becomes
    `workl[ offsetWorkl + (p-1)*strideWorkl ]`. The `iq` block is an `ncv x ncv`
    column-major matrix `Q` with leading dimension `ldq = ncv`, so calls into
    `dsteqr` / `dgeqr2` / `dorm2r` / `dsesrt` pass `strideZ1 = strideWorkl` and
    `strideZ2 = strideWorkl*ldq` with `offsetZ = offsetWorkl + (iq-1)*strideWorkl`.
-   **`jj = workl(bounds+ncv-j)` is a float used as an index.** The index array
    is seeded with integers (`workl(bounds+j-1) = j`) and only permuted by
    `dsgets`, so the stored values stay exact integers; they can be used
    directly in `workl[ ... + (ibd+jj-2)*strideWorkl ]` and `select[ (jj-1)*... ]`.
-   **String-flag mapping into the LAPACK deps.** ARPACK's Fortran flags map to
    the blahpack spellings: `dsteqr('Identity', ...)` → `'initialize'`,
    `dorm2r('Right','Notranspose', ...)` → `'right','no-transpose'`,
    `dorm2r('Left','Transpose', ...)` → `'left','transpose'`,
    `dlacpy('All', ...)` → `'all'`.
-   **The `Left/Transpose` `dorm2r` needs a length-1 scratch.** The reference
    passes a scalar `temp` as the WORK argument (N = 1). In JS this is a
    `new Float64Array( 1 )`.
-   **`info` is pure OUTPUT.** Returned directly; error branches `return ierr`
    and the `nconv === 0` quick return `return 0`. `ipntr(4,8,9,10)` are written
    faithfully (outputs) even though nothing downstream reads them here.
-   Only `howmny = 'A'` is implemented in the reference; `'S'` returns `-16`.

## Dependency interface surprises

-   `dlacpy` returns `B` (not `void`); `dsteqr` / `dgeqr2` / `dorm2r` return an
    integer info. `dsgets` / `dsortr` / `dsesrt` are void and permute in place.

## Fixture strategy

-   `dseupd` cannot be exercised in isolation: its inputs are the converged
    state of `dsaupd` (which is not yet translated). The Fortran driver
    (`test_dseupd.f90`) therefore runs the **full `dsaupd` + `dseupd` pipeline**
    on the 10x10 1-D Laplacian, records the exact post-convergence inputs
    (`v`, `workl`, `workd`, `resid`, `iparam`, `ipntr`) *before* calling
    `dseupd` (which overwrites them), then records the outputs (`d`, `z`,
    `info`). The JS test reconstructs those exact inputs and reproduces the
    outputs: eigenvalues matched **bit-for-bit** and Ritz vectors to ~1e-16
    sign-for-sign.
-   The shipped `debug.h` is fixed-form and cannot be `include`d into a free-form
    `.f90` driver; declare the `/debug/` COMMON block directly in free form and
    zero the `msglvl` variables to silence trace output.
-   `dseupd`'s fixture build needs `dnrm2` (BLAS `.f90`, auto-linked for arpack)
    and, via `dgetv0`, `dlarnv` / `dlaruv` (LAPACK) added to `deps_dseupd.txt`.
