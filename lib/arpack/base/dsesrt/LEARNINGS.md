# dsesrt: Translation Learnings

## Translation pitfalls

-   **In-place, no return** (same as `dsortr`): sorts `x` and permutes columns
    of `A` in place; returns `void`.
-   **Companion is a matrix, not a vector.** Where `dsortr` swaps a companion
    vector element, `dsesrt` swaps the first `na` rows of two *columns* of `A`
    via `dswap`. `na` can be less than the number of rows, so only part of each
    column moves — the fixtures exercise `na < nrows`.
-   **Matrix gets two strides in base.js.** The signature generator emitted the
    `a, strideA, offsetA, lda` shape; the base layer instead takes
    `A, strideA1, strideA2, offsetA` (like `dgbtrf`). `lda` belongs only to the
    main (`dsesrt.js`) API, where `strideA1 = 1`, `strideA2 = lda`.
-   ARPACK `which` codes kept verbatim with a TypeError guard, as in `dsortr`.

## Dependency interface surprises

-   `dswap` (BLAS) is auto-linked in the Fortran fixture build, so
    `deps_dsesrt.txt` lists nothing.
