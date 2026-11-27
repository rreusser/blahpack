# dlarzb: Translation Learnings

## Translation pitfalls

- `dlarzb` only supports `DIRECT='B'` (backward) and `STOREV='R'` (rowwise).
  The reference Fortran explicitly errors out on any other combination.
  This matches `dlarzt`, which also only supports that one combination.
- `V` is a `K`-by-`L` matrix (not `K`-by-`N`). `L` is the number of trailing
  columns of the original matrix that were zeroed by the RZ factorization;
  the block reflector acts on rows `M-L+1..M` (for `SIDE='L'`) or columns
  `N-L+1..N` (for `SIDE='R'`). The "implicit identity" part of the reflector
  corresponds to the leading rows/columns, which explains why the updates
  split into a DCOPY of the leading `K` rows/columns of `C` and a DGEMM
  involving only the last `L`.
- The `WORK` matrix in the reference is `LDWORK`-by-`K`. For `SIDE='L'` the
  leading dimension must be at least `N`; for `SIDE='R'` it must be at least
  `M`.  The dense-matrix wrapper validates this.
- When `L = 0` the two `DGEMM` calls are skipped and `dlarzb` reduces to
  copying the leading `K` rows/columns of `C` into `WORK`, applying `T`
  (possibly transposed) with `DTRMM`, and subtracting the result back — the
  `V` matrix is unreferenced in that case, so the test uses an all-zero V.

## Dependency interface surprises

- `DTRMM('Right','Lower',...)` is used with the lower-triangular `T` produced
  by `dlarzt`. When `SIDE='L'` the reference passes `TRANST`, which is the
  opposite of the user-supplied `TRANS` (because the update is `C - V^T T W^T`
  vs `C - V W`).  This is the same pattern as `dlarfb`.
- The left-side path uses `DGEMM('T','T',N,K,L,...)` rather than the more
  obvious `('T','N',N,K,L,...)` because `W` is stored transposed relative to
  the natural layout — rows of `C` are copied into columns of `W`.
