# dhsein: Translation Learnings

## Translation pitfalls

- The Fortran `KL`/`KR` loop variables track the boundaries of an unreduced
  Hessenberg block containing `K`. They are initialized to 1 and N (1-based)
  respectively when not `FROMQR`, and updated only when `FROMQR`. In the
  0-based translation `kl=0` and `kr=N-1`. `kln` is used as a cache sentinel
  so `hnorm`/`eps3` are only recomputed when the block bounds change; I use
  `kln=-1` as the initial sentinel so the first unreduced block always
  triggers recomputation.
- `M` in the Fortran signature is an output parameter. In this JS
  translation the function returns `{ info, m }` and the positional `M`
  argument is unused (kept only so the signature matches the wrapper). The
  signature-conformance ESLint rule emits a warning about the 36-arg count
  because the canonical stdlib pattern excludes `WORK`.
- `SELECT` is a Uint8Array (or plain Array). The Fortran code sets
  `SELECT(K)=.FALSE.` on the second member of a complex pair and
  `SELECT(K)=.TRUE.` on the first; the JS translation writes `0`/`1`
  values, which compare truthy/falsy cleanly.
- The perturbation loop (Fortran label 60) is a `GOTO`-based retry.
  Translated as an outer `for ( ; ; )` with an inner loop that sets a
  `converged=false` flag + `break`s out when `wkr` is bumped, restarting
  the outer loop.
- `IFAILL`/`IFAILR` entries are 1-based `K` indices in Fortran; I write
  `k+1` to match the fixture exactly.

## Dependency interface surprises

- `dlaein` takes VR/VI as 1D arrays (each one column) with a single stride,
  plus a 2D workspace `B` with `(strideB1, strideB2)`. In dhsein the Fortran
  call passes `WORK` for `B` with leading dimension `LDWORK=N+1`, and
  `WORK(N*N+N+1)` as the separate length-N scratch `WORK` argument. In JS:
  pass the same `WORK` Float64Array twice, with `strideB1=1`,
  `strideB2=N+1`, `offsetB=offsetWORK`, and `offsetWORK+N*N+N` for the
  scratch.
- For the left-eigenvector call, the H submatrix starts at
  `H(KL, KL)` with submatrix size `N-KL+1` (Fortran). The VL columns
  passed to dlaein start at `VL(KL, KSR)` / `VL(KL, KSI)` — i.e. the
  first `KL-1` entries of the column are untouched by dlaein and must be
  zeroed by dhsein after the call.
- `dlanhs` with `'infinity'` norm requires a scratch `WORK` of length at
  least the submatrix order; since dhsein has not yet used the first N
  entries of its `WORK` buffer (dlaein not yet called for this k) it's
  safe to reuse `WORK[0..N-1]`.
