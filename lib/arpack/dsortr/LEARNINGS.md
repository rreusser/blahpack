# dsortr: Translation Learnings

## Translation pitfalls

-   **In-place, no return.** `dsortr(which, apply, n, x1, x2)` sorts `x1` (and
    permutes `x2` when `apply`) in place and returns nothing. The JS returns
    `void`; the benchmark validates on `x1[0]` rather than a return value.
-   **`which` codes kept as-is.** ARPACK's ordering codes `'LM'`/`'SM'`/`'LA'`/
    `'SA'` are the shared public vocabulary of the whole eigensolver family
    (`dsaupd` users pass them), so they are kept verbatim rather than mapped to
    long-form strings. They are two characters, so the "no single-char flag"
    gate check does not apply.
-   **Semantics vs. names.** `dsortr` moves the selected values toward the *end*
    of `x1` (e.g. `'LA'` yields ascending order, largest last). The translation
    reproduces the swap conditions exactly, so the naming is irrelevant to
    correctness — the fixtures pin the actual ordering.
-   **Integer division** `n/2` and `igap/2` → `n >> 1` / `igap >>= 1` (both
    operands non-negative, so the shift matches Fortran floor division).

## Dependency interface surprises

-   None — `dsortr` is self-contained (no BLAS/LAPACK/ARPACK calls), so
    `deps_dsortr.txt` is empty.
