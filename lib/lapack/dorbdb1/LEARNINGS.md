# dorbdb1: Translation Learnings

## Translation pitfalls

- The Fortran `dorbdb1` declares `WORK(1)` as the LWORKOPT slot before any
  use; the helpers receive `WORK(ILARF)` = `WORK(2)` and
  `WORK(IORBDB5)` = `WORK(2)`. In JS we drop the LWORK convention entirely
  — the user passes a workspace array and `offsetWORK` is the start. Both
  helpers can use `offsetWORK + 0` directly because we never need to
  reserve a slot for an LWORK return value. (`LWORK >= M-Q` is more than
  enough for both `LLARF = max(P-1, M-P-1, Q-1)` and `LORBDB5 = Q-2`.)
- The Q-2 sub-projection at the end of each loop iteration calls
  `dorbdb5` with N=Q-i-2. When N=0 (which happens at the last entry of
  the inner if-branch), `dorbdb5` degenerates to a normalize-only step
  via `dscal` — that's intentional and matches the Fortran behavior.
- The Fortran source always uses `M-P` as a single quantity. The base.js
  signature accepts both `M` and `P` (and validation lives in the
  wrapper), so `M` is referenced inside the algorithm body via `M - P`
  expressions; we do not pre-compute `MP`. This keeps the shape of the
  translation close to the reference.
- The `**` exponent operator failed under the project's parser even
  though it parses in V8. Replaced `dnrm2(...) ** 2` with explicit
  `n*n` temporaries and added `n1`, `n2` locals. Worth noting: prefer
  `n*n` (or hoisted `Math.pow`) over the `**` operator project-wide
  to avoid this trap.

## Test-design pitfalls (broadly applicable)

- **Orthonormalization is sensitive to FP order; do not regenerate
  inputs in JS.** I initially built the orthonormal-column input matrix
  in both Fortran (test_dorbdb1.f90) AND in the JS test (via classical
  Gram-Schmidt twice on identical sin-based seed data). Despite using
  the same operations on the same inputs, the second pass of MGS
  diverged between Fortran and JS for column 3 (the values agreed for
  cols 1 and 2). Floating-point round-off accumulates differently when
  the Fortran build reorders intermediates differently than V8 does.
  The fix: print the input matrices into the fixture (`X11in`,
  `X21in`) and have the JS test load them rather than recomputing.
  This is broadly useful any time the input itself depends on a
  numerical pre-processing step.
- **The `Fortran array reuse` pitfall (already in SKILL.md) is real
  for THETA/PHI/TAUP*/TAUQ1.** Without zeroing those arrays between
  test cases, `print_array(..., q)` for case k can read stale entries
  from case k-1 (when case k uses a smaller `q`/`p`). Added a
  `zero_outputs` helper to the Fortran test that clears all five
  arrays between cases.

## Dependency interface surprises

- `dlarfgp(N, alpha, offsetAlpha, x, strideX, offsetX, tau, offsetTau)`
  passes alpha as `(array, offset)` because the Fortran reference
  treats `alpha` as a single array element addressed via Fortran's
  pass-by-reference. In `dorbdb1`, alpha is `X11(I,I)` and `x` starts
  at `X11(I+1,I)` — both inside the same `X11` array. This works
  cleanly with the stdlib API: pass `X11` twice with different
  offsets.
- `dlarf` takes `tau` as a scalar (not as `(array, offset)`). When
  `dorbdb1` writes a Householder scalar to `TAUP1(I)` and then
  immediately uses it in a `dlarf` call, the JS wrapper extracts the
  scalar inline: `TAUP1[ offsetTAUP1 + ( i * strideTAUP1 ) ]`.
- `drot(N, x, strideX, offsetX, y, strideY, offsetY, c, s)` puts the
  rotation cos/sin scalars at the END of the argument list. Easy to
  misorder when transcribing from the Fortran `DROT` call.

## Coverage notes

- 100% line + 100% branch on `base.js`. The two PHI/TAUQ1 paths and
  the `dorbdb5` re-orthogonalization path are all exercised by the
  `m10_p5_q3` fixture (Q=3 → 2 entries into the inner if-block).
- 100% on the wrapper (`dorbdb1.js`) by exercising row-major +
  column-major LD validation as well as the dimension constraint
  branches.

## Process improvements

- The scaffold-emitted `dorbdb1.js` had two bugs that were not caught
  by ESLint: it referenced an undefined `N` variable in the LD
  validation, and the row-major LD bound was wrong (it should be
  `Q`, not `M`). The scaffold's LD validator template is brittle for
  rectangular matrices like `X11` (`P`-by-`Q`) — it picks `M` or `N`
  by guessing from the array name. For non-square LAPACK matrices,
  always audit the generated `<routine>.js` LD checks against the
  Fortran spec.
- The scaffold's `dlarf` calls and `dorbdb5` calls have many shared
  offset patterns (`oX11ii + strideX111 + strideX112` = X11(i+1,i+1),
  etc.). For a routine this dense in offset arithmetic, defining a
  small `at(off, di, dj)` helper or accepting the verbose explicit
  offsets is a tradeoff. I kept them explicit here since the call
  sites mirror the Fortran one-to-one and mistakes are localized;
  but for any future routine with more than ~3 stencil points,
  consider a helper.
