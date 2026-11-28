# dlarrb: Translation Learnings

## Translation pitfalls

- The Fortran outer `DO...GO TO 80` loop is a classic post-tested bisection
  loop: `iter` increments before the condition, and the condition
  `NINT > 0 .AND. ITER <= MAXITR` is checked after the pass. Direct
  translation is a `while (true) { ... iter += 1; if (!(NINT > 0 && iter
  <= MAXITR)) break; }` — using `while (NINT > 0 && iter <= MAXITR)`
  drops the final pass and underconverges.
- `OFFSET` is subtracted from 1-based eigenvalue indices `i` to yield the
  storage slot `II = i - OFFSET`. The gap array `WGAP` is indexed by
  `II - 1` when looking at the *left* gap of eigenvalue `i`.
- The entry-time pre-convergence branch (width <= CVRGD on initial
  interval) uses `WIDTH = 0.5 * |LEFT - RIGHT|` — a *semi*-width after
  re-bracketing, not the raw half-width `WERR`. Required because
  DLANEG-driven expansion may have widened the interval first.
- The "already-converged marker" stored in `IWORK(2*i-1)` is `-1` when
  the entry interval converges and `0` when converged inside the
  iterative loop — dlarrb uses both to control relinking of the
  singly-linked list of unconverged intervals.
- `twist < 1 || twist > N` defaults to `N` — do not omit this clamp,
  dlaneg treats `r` as the twist pivot index and out-of-range values
  give silently wrong counts.

## Dependency interface surprises

- dlaneg `base.js` already uses ndarray-style arguments `(N, d, strideD,
  offsetD, LLD, strideLLD, offsetLLD, sigma, pivmin, r)`, so the parent
  passes its own offsets through directly — no `stride2offset` needed.
- Needed to add `dlamch` to `test/fortran/deps_dlarrb.txt`. `deps.py`
  did not pull it because the JS translation hardcodes constants, but
  the Fortran fixture program links against `DLAMCH`.

## Coverage gaps

- The DLANEG-driven left/right expansion loops (`back *= 2.0`) require
  hand-crafted inputs where the initial `w ± WERR` brackets do not
  contain the true eigenvalue. Added a targeted test that gives W way
  off with tight WERR.
- The entry-time "already converged" branch (width <= CVRGD on entry)
  requires tight WERR; added a dedicated test.

## Process notes

- The scaffolded `test/test.<routine>.js` shipped with an "invalid
  order" TypeError assertion and arity `25`, neither of which applies
  to a 1D routine with no layout parameter. Rewrote it to match the
  actual 24-arity layout-free wrapper.
- The scaffolded `benchmark/benchmark.js` allocated six `uniform`
  arrays of length up to `10^6` and called dlarrb with nonsense
  strides/offsets (all `N`), which would have looped forever inside
  the DLANEG expansion. Replaced with a deterministic diagonal
  tridiagonal at `len ∈ [10, 1000]`.
