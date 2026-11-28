# dtprfb: Translation Learnings

## Translation pitfalls

-   The routine has 8 fully distinct dispatch paths (2 `side` x 2
    `direct` x 2 `storev`) — all must be implemented. Each path
    reorders its calls to `DTRMM`/`DGEMM` and uses different
    `UPLO`/`TRANS` arguments, so the code cannot share much structure.
-   Fortran `KP = MIN(L+1, K)` / `MP = MIN(M-L+1, M)` translate to
    0-based offsets. The clamps only matter in degenerate cases
    (L==0, L==K, L==M/N), where the corresponding GEMM/TRMM calls are
    zero-sized — but be sure the clamp matches the Fortran semantics
    so pointer arithmetic stays in range. For forward paths use
    `kp = (l > K) ? K : l`; for backward paths use
    `kp = (l >= K) ? K : K - l`.
-   `V(MP, KP)` in Fortran is 1-based; when translating, the
    0-based form is `offsetV + mp*strideV1 + kp*strideV2` where
    `mp`/`kp` are already 0-based. Getting the stride assignment
    (strideV1 vs strideV2) wrong silently corrupts only the trapezoidal
    correction and is easy to miss with L=1 fixtures. Compare against
    the Fortran call site carefully when touching these blocks.
-   Row-storage branches use `'L','L'`/`'L','U'` inversions versus the
    column branches — the `UPLO` argument flips when STOREV flips, but
    the `SIDE` does not. Transcribe the DTRMM UPLO from each Fortran
    branch individually; do not try to derive it.

## Dependency interface surprises

-   None — `dgemm` and `dtrmm` are well-behaved and already match the
    signature convention used throughout blahpack.

## Coverage gaps

-   Branch coverage on base.js is dominated by the `kp`/`mp` ternary
    clamps. Covering all 8 paths with L=1 gives ~84% branch coverage;
    adding a single L==K test per side pushes it over 85%.

## Automation opportunity

-   The 402 `no-mixed-operators` ESLint errors on stride index
    arithmetic (`i*strideA1 + j*strideA2`) had to be fixed by wrapping
    every bare `var*stride*` term in parentheses. A codemod that
    applies this transformation when emitting base.js would remove the
    post-hoc fixup step entirely. The same pattern appears in every
    2D-indexed routine.
-   `bin/lint-fix.sh` re-adds a blank line after `'use strict';` in
    test.js files, which then fails `stdlib/section-header-empty-lines`.
    The codemod should only ensure two newlines if there isn't already
    an `'use strict';` directly above the section header.
