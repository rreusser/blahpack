# zlamtsqr: Translation Learnings

## Translation pitfalls

-   **`II` indexing.** Fortran uses `II = M-KK+1` (1-based row index of the
    trailing block). In JS this becomes `ii = M - kk` (0-based). When `KK=0`
    the Fortran sets `II = M+1` (so the trailing-block branch is skipped); the
    JS analog is `ii = M`. The asymmetry between the two SIDE='L'/'R' and
    TRANS='N'/'C' branches is genuine — left/notrans and right/ctrans use the
    backward (`KK > 0` first) form while left/ctrans and right/notrans use
    the forward (`KK > 0` last) form.

-   **Loop bounds for the inner ZTPMQRT sweep.** Fortran loops are 1-based and
    inclusive on both ends. The backward form `DO I = II-(MB-K), MB+1, -(MB-K)`
    converts to `for (i = ii - (mb-K); i >= mb; i -= (mb-K))` (0-based,
    inclusive on both bounds). Forward form `DO I = MB+1, II-MB+K, (MB-K)`
    becomes `for (i = mb; i <= ii - (mb-K); i += (mb-K))`.

-   **CTR (T column block) indexing.** Fortran `T(1, CTR*K + 1)` selects the
    column starting at `CTR*K` (0-based after subtracting 1). JS offset is
    `offsetT + (ctr * K * strideT2)`. The "first block" call uses
    `offsetT + 0 = offsetT` directly; the loop variant of CTR varies
    (decremented before use in backward, incremented after use in forward).

-   **MB > MAX(M,N,K) fall-through.** Both `mb <= K` and `mb >= max(M,N,K)`
    short-circuit to `zgemqrt` on the entire panel — no pentagonal blocks are
    used. This branch is the entire path when callers pass `MB` larger than
    the matrix; the JS test exercises both `left+notrans+fallthrough` and
    `right+notrans+fallthrough`.

-   **Quick-return predicate.** `MIN(M, N, K) == 0` triggers quick return.
    Tested via three separate paths (M=0, N=0, K=0).

## Dependency interface surprises

-   **`ztpmqrt`'s A vs B convention.** When SIDE='L' the upper block (A) is
    `K`-by-`N` and the lower block (B) is `M`-by-`N`. ZLAMTSQR always passes
    `C(1,1)` as the upper block and `C(II,1)` as the lower — the upper block
    is the first `K` rows of `C` (which is also where the apply ultimately
    accumulates results from later TPQRT blocks). Same on SIDE='R' but with
    columns: A = `M`-by-`K` left columns of C, B = `M`-by-`(MB-K)` (or `KK`)
    middle/trailing columns.

-   **WORK forwarding.** `zgemqrt` and `ztpmqrt` both auto-allocate when their
    incoming WORK is undersized. ZLAMTSQR has no need to size or partition
    WORK — it forwards the caller's buffer to each kernel and the kernels
    handle re-allocation transparently.

## Complex number handling

-   **No reinterpret in base.js.** Because zlamtsqr is purely a dispatch
    layer over `zgemqrt` and `ztpmqrt` (which themselves do the
    reinterpret), this base.js never touches Float64 views. The `z-prefix
    uses reinterpret()` gate check warns but does not fail; document this
    in `conformance.config.json` if needed.

-   **trans='transpose' is rejected.** Both `zlamtsqr.js` (wrapper) and
    `ndarray.js` explicitly throw on `'transpose'` because Q is unitary
    (`Q^H`, not `Q^T`). The whitelist accepts only `'no-transpose'` and
    `'conjugate-transpose'`.

## Coverage gaps

-   `qmax = K` branch (line 100-101) is unreachable when inputs satisfy
    `K <= max(M,N)` — left side has `K <= M` and right side has `K <= N`,
    so `K > max(M,N)` is impossible for valid inputs. Marked with an
    inline comment, not a TODO.

## Process notes

-   The Fortran test wraps both ZLATSQR and ZGEQRT as factorization sources;
    the fixture stores A, T, C0 (input) and C (expected output) so the JS
    test can call zlamtsqr directly without recomputing the factorization
    in JS. This avoids the circular dependency that would arise from using
    zlatsqr (not yet translated) in the JS test.

-   Initial draft used MB=4, K=3 / MB=4, K=2 → both produced KK=0; needed
    M=12, K=3, MB=5 (M-K=9, MB-K=2, mod=1) to actually hit the trailing-
    block branch. Always check the modulus when designing the blocked test
    case.
