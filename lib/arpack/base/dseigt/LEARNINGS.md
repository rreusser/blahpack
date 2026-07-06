# dseigt: Translation Learnings

## Translation pitfalls

-   **H's 2-column layout.** The reference stores the tridiagonal in `h(ldh,2)`:
    column 2 (index 1) is the main diagonal `h(1:n,2)`, column 1 (index 0) is
    the subdiagonal `h(2:n,1)`. The base copies the diagonal (offset
    `offsetH + strideH2`) into `eig` and the subdiagonal (offset
    `offsetH + strideH1`, length N-1) into the front of `workl`.
-   **workl doubles as e and WORK for dstqrb.** `dstqrb`'s subdiagonal input
    lives in `workl[0..N-2]` and its workspace starts at `workl[N]`
    (`workl(n+1)` 1-based). `workl` must be `>= 3*N`.
-   `ierr` is a pure output → returned. Ritz estimates are `rnorm*|bounds(k)|`
    after `dstqrb` writes the last eigenvector row into `bounds`.

## Dependency interface surprises

-   Calls `dcopy` (BLAS, auto-linked) and the just-translated `dstqrb`. The
    Fortran fixture build must also link `dvout` (a debug print that is
    referenced but, with `msglvl = 0`, never executed) plus dstqrb's whole
    closure (see `deps_dseigt.txt`).
