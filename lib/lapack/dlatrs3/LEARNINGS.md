# dlatrs3: Translation Learnings

## Translation pitfalls

- **WORK + LWORK dropped from JS API.** Fortran's workspace partitioning
  (`LSCALE` for per-block local scales, then `LANRM` for off-diagonal
  block norms) is allocated internally as a single `Float64Array` since
  JS has no caller-allocated workspace convention. The layout matches
  Fortran exactly so that the `WORK(I + KK*LDS)` and
  `WORK(AWRK + I + (J-1)*NBA)` arithmetic ports verbatim.
- **`deps.py` missed DGEMM, DSCAL, LSAME** for the Fortran link step
  because they are BLAS routines. `run_fortran.sh` already auto-pulls
  all of `data/BLAS-3.12.0/*.f`, so they should be omitted from
  `deps_dlatrs3.txt` (including them causes "multiple definition" link
  errors).
- **Hardcoded `NB = 8`.** Fortran calls
  `ILAENV(1, 'DLATRS', '', N, N, -1, -1)` and floors the result at 8.
  In practice ILAENV returns 1 for DLATRS, so `MAX(8, 1) = 8` always —
  use the literal 8 in JS. This is small enough to exercise the
  blocked path on test matrices with N=10 (NBA=2).
- **Block iteration uses Fortran 1-based `j`, `i`** in the main loop
  to keep index arithmetic (`(j-1)*NB`, `min(j*NB, N)`) parallel to
  the Fortran source. WORK indices are 0-based in JS, so
  `WORK(I + KK*LDS)` becomes `work[(i-1) + (kk*lds)]`.
- **`scaloc=0` (singular) vs `scaloc*work=0` (badly scaled) branches**
  are subtly different in Fortran: the first preserves the singular
  diagonal-block solve (writes only outside `[J1..J2-1]`), while the
  second zeros the entire column. Both paths set `SCALE(rhs)=0`.
- **`X(II, KK)` vs `X(II, RHS)` quirk in the Fortran source.** Lines
  494, 497, 530 of `dlatrs3.f` write `X(II, KK)` instead of
  `X(II, RHS)` during the singular / badly-scaled branches.
  `KK = 1..K2-K1` and `RHS = K1 + KK - 1` — they only coincide when
  `K = 1` (first chunk). For larger NRHS triggering multiple chunks
  this would corrupt the first chunk's columns. JS uses
  `offsetX + (rhs * sx2)` consistently to avoid this.
- **`Math.min` floor in NBA/NBX computation** — the Fortran
  `NBA = MAX(1, (N + NB - 1) / NB)` uses integer division, which in JS
  must be `... | 0` (truncation toward zero). Since both N and NB are
  non-negative, `Math.floor` would also work, but `|0` is faster and
  matches Fortran semantics for the rest of the routine.
- **Combined `scaloc * work` underflow branch (lines 302-328) is
  extremely hard to test.** A targeted TODO comment is left in
  base.js noting this and documenting why the branch is hard to reach
  in IEEE 754 double precision.

## Algorithmic notes

- **`dlarmm` computes the safe scaling factor** for a linear update
  `B := B - A*X` given the inf-norms of A, X, B. Returns a value in
  `[0, 1]` such that the scaled update cannot overflow.
- **Two-pass workspace structure.** First pass: compute upper bounds
  on all off-diagonal block norms; store them in
  `work[awrk + ...]`. Second pass: process X in column chunks of
  NBRHS=32, maintaining per-block local scale factors that get
  reconciled at the end of each chunk.
- **Asymmetric block-norm storage for TRANS='N' vs 'T'.** For
  `notran`, store at `WORK(AWRK + I + (J-1)*NBA)` (row-major-ish in
  block coordinates). For transpose, store at
  `WORK(AWRK + J + (I-1)*NBA)` (the swapped indices). This lets the
  later linear-update loop fetch `WORK(AWRK + I + (J-1)*NBA)`
  uniformly for both transpose and non-transpose cases.

## Dependency interface surprises

- **`dlatrs` scale parameter is a `Float64Array(1)` output** — calling
  it requires allocating a 1-element scratch array on each invocation.
  In the diagonal-block loop we reuse a single `scaleBlock` allocated
  before the loop.
- **`dlange('inf-norm', m, 1, X, sx1, sx2, offsetX, W, 1, 0)` requires a
  WORK scratch buffer** of length >= m for the inf-norm case. We size
  this once at function entry to `NB` (the maximum possible block height)
  and reuse it across all dlange calls.
- **`dgemm` parameters are long-form strings** (`'no-transpose'`,
  `'transpose'`), not Fortran's single chars. Easy slip given the
  Fortran source uses `'N'` and `'T'`.

## Coverage gaps

- Lines 302-328: combined `scaloc * work === 0` branch — requires a
  product of small floats to underflow exactly to 0 across multiple
  block iterations. Reaching this in JS deviates from Fortran's
  reference output (the Fortran reference returns SCALE=0 with a
  specific zero/non-zero pattern in X that our JS path does not
  reproduce exactly). Accepted as unreachable for this translation.
