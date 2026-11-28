# dlartgs: Translation Learnings

## Translation pitfalls

- The Fortran `THRESH = DLAMCH('E')` is a module-scope constant; hoisted to
  `THRESH = 2.220446049250313e-16` to match DLAMCH('E') (double-precision eps).
- The first branch fires on two *distinct* conditions joined by OR: either
  (sigma == 0 AND |x| < eps) OR (|x| == sigma AND y == 0). Both map to
  `z = w = 0`, which becomes a PI/2 rotation via the swapped-arg dlartgp call.
- The `else` branch uses `s = sign(1, x)` and computes
  `z = s * (|x| - sigma) * (s + sigma/x)`, which is algebraically equivalent
  to `(x^2 - sigma^2) / x` but more numerically stable when `|x| ~ sigma`.

## Dependency interface surprises

- Our `dlartgp(f, g, out)` writes `[cs, sn, r]` into `out`. The Fortran
  reference calls `CALL DLARTGP(W, Z, SN, CS, R)` — crucially swapping
  the `cs`/`sn` argument positions. The comment in the Fortran source
  explains why: this argument reordering ensures that if `z = 0` then the
  resulting rotation is by PI/2 (because dlartgp's `g = 0` fast path writes
  `cs = sign(1, f), sn = 0`, and here `f = w`, so that becomes
  `SN = sign(1, w), CS = 0`).
- Consequently, after `dlartgp(w, z, SCRATCH)` we write
  `out[0] (dlartgs cs) = SCRATCH[1] (dlartgp sn)` and
  `out[1] (dlartgs sn) = SCRATCH[0] (dlartgp cs)`.

## Missing automation

- The scaffolded `test.dlartgs.js` assumed a layout-wrapper signature
  (5 args, throws TypeError for invalid order). For scalar-in/scalar-out
  routines like dlartgp/dlartgs that have no layout/dimension params, the
  scaffolder should emit a scalar-wrapper template that only checks arity
  and return-object shape.
- The scaffolded `benchmark.js` generated `dlartgs(N, N, N, N, N)` with a
  varying-N loop and `isnan(y)` on a non-numeric return — both inappropriate
  for a scalar rotation routine. A scalar-routine benchmark template would
  save time.
- `lint-fix.sh` rewrote multi-line block comments by capitalizing the first
  word of *each* line (splitting the comment where the auto-formatter
  inserted a blank line). Needed to collapse the comment into a single line
  to work around it. Would be worth teaching the lint autofixer to only
  enforce capitalization on sentence starts (after a period or block-comment
  boundary), not mid-sentence.

## Coverage gaps

- base.js reaches 100% line / 100% branch coverage via 15 targeted cases
  that exercise every branch of the 5-way conditional:
  (1) first clause (both subconditions), (2) sigma==0 positive x,
  (3) sigma==0 negative x, (4) |x|<thresh with sigma!=0, and
  (5) full else branch for both signs of x.
