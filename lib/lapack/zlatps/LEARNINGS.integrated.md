# zlatps: Translation Learnings

## Translation pitfalls

- Packed storage IP tracking: Fortran uses `IP = JFIRST*(JFIRST+1)/2` which
  gives the diagonal position for BOTH upper and lower packed storage when
  JFIRST is 1 or N. The same formula works in 0-based JS as
  `(jfirst*(jfirst+1)/2) + jfirst` for both cases.
- No-transpose careful solve IP update: Fortran `IP = IP - J` (upper) and
  `IP = IP + N - J + 1` (lower) with 1-based J. In 0-based: upper uses
  `ip -= (j+1)*sap`, lower uses `ip += (N-j)*sap`.
- Transpose/conjugate-transpose IP update: Fortran `IP = IP + JINC*JLEN`
  where JLEN is incremented BEFORE the IP update. Must match this order.

## Dependency interface surprises

- `dlamch('precision')` vs `dlamch('epsilon')`: Fortran uses
  `DLAMCH('Precision')` = eps*base = 2*eps, but existing JS code (zlatrs)
  uses `dlamch('epsilon')` = eps. This causes a factor-of-2 difference in
  SMLNUM/BIGNUM. Used `dlamch('precision')` to match Fortran exactly.
- `zaxpy` and `zdotc`/`zdotu` take complex-element offsets.
  Packed storage offsets must be converted from Float64 indices using `ip/2`.

## Automation opportunities

- The packed storage IP tracking pattern is shared between zlatps, dlatps,
  and similar routines. A shared helper for IP calculation could reduce bugs.

## Coverage gaps

- The `transpose` (non-conjugate) careful solve path uses `zdotu` which is
  tested indirectly through the unit-diagonal normin=yes test. Could add
  explicit careful-solve tests for the transpose path.

## Complex number handling

- Complex division uses zladiv via scratch buffers (ZLADIV_X, ZLADIV_Y,
  ZLADIV_OUT) following the zlatrs pattern. Never inline.
- Conjugate transpose: negate imaginary part of diagonal (`-av[ip+1]`)
  and pass `conjugate=true` to `computeTransposeSum`.
- `cabs1` and `cabs2` operate on Float64Array views with explicit indices.
