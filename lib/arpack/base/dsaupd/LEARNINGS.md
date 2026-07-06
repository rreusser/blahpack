# dsaupd: Translation Learnings

dsaupd is the top-level reverse-communication driver for the symmetric
eigenproblem. It is a thin wrapper: argument checking, `workl` partitioning,
`ipntr` setup, then a straight pass-through to `dsaup2` on every call.

## The mixed ipntr convention

The single `ipntr` array carries two different index conventions, and both
must be honored to interoperate with the rest of the closure:

-   `ipntr(1:3)` (array indices 0..2) are **0-based** offsets into `workd`,
    written by `dsaup2`/`dsaitr`/`dgetv0`. The caller uses these directly to
    index `workd` when applying OP/B, so 0-based is the natural JS convention.
-   `ipntr(4:7,11)` (array indices 3..6, 10) are ARPACK's **1-based** offsets
    into `workl`, written here in `dsaupd` and read by `dseupd` (which does its
    own `-1` when indexing). `dseupd` was translated first and already assumes
    1-based here, so `dsaupd` must match: write `ih=1`, `ritz=1+2*ncv`, etc.,
    not their 0-based equivalents.

## Passing workl slices to dsaup2

`dsaup2` takes `H`, `ritz`, `bounds`, `Q`, and its shift workspace as separate
strided arrays. Here they are all slices of the SAME `workl` buffer, passed as
`workl` with different offsets (`offsetWorkl + (ptr-1)*strideWorkl`). `H` and
`Q` are column-major with leading dimension `ldh = ldq = ncv`, so their column
stride passed to `dsaup2` is `ncv*strideWorkl` (two strides, not a scalar
`lda`).

## The info parameter

Like `dsaup2`, the Fortran `info` is intent(inout): read once as the
initial-residual flag (`info != 0` means the caller supplied `resid`) and then
overwritten with the exit status. The JS API takes a trailing `infoIn` (the
input flag) and RETURNS the status. `dsaupd` forwards `infoIn` to `dsaup2` on
every call; `dsaup2` only consults it on its first entry.

## Statistics counters

`iparam(9:11)` (NUMOP / NUMOPB / NUMREO) come from the ARPACK stat COMMON block,
which is stubbed out in this translation. They are set to 0 on exit rather than
tracked.

## Fixtures

Driven with OP=A (standard, B=I), mode 1, `ishift=1`, `info=1` (deterministic
residual). Cases LM/SA/LA match the Fortran to ~1.5e-12 with EXACT
nconv/mxiter/info/ido, confirming the wrapper hands off to `dsaup2` correctly.
The LM Ritz values are bit-consistent with the standalone `dsaup2` LM fixture,
which cross-checks the workl partitioning.
