# dtgsen: differences from the reference

## [REFERENCE] WORK minimum for `ijob` 1, 2 and 4

The reference documents and checks `LWORK >= MAX(4*N+16, 2*M*(N-M))` for
`IJOB = 1, 2, 4`, but its own DTGSYL calls get `WORK(2*M*(N-M)+1)` with length
`LWORK - 2*M*(N-M)`, and DTGSYL rejects a length below 1 (`INFO = -20`). So at
the documented `2*M*(N-M)` (when that term decides) the reference's call fails
inside DTGSYL. `ndarray.js` demands the smallest length neither rejects:
`2*M*(N-M) + 1` when `M*(N-M) > 0` (and at least `4*N+16`). The layout wrapper's `null`
allocation is raised to the same.
