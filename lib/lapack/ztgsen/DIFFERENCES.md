# ztgsen: differences from the reference

## [REFERENCE] WORK minimum for `ijob` 1, 2 and 4

The reference documents and checks `LWORK >= MAX(1, 2*M*(N-M))` for
`IJOB = 1, 2, 4`, but its own ZTGSYL calls get `WORK(2*M*(N-M)+1)` with length
`LWORK - 2*M*(N-M)`, and ZTGSYL rejects a length below 1 (`INFO = -20`). So at
the documented `2*M*(N-M)` (when that term decides) the reference's call fails
inside ZTGSYL. `ndarray.js` demands the smallest length neither rejects:
`2*M*(N-M) + 1` when `M*(N-M) > 0`. The layout wrapper's `null`
allocation is raised to the same.
