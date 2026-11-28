# zlasyf_rook: Translation Learnings

## Translation pitfalls

- Almost a pure d->z mechanical port from `dlasyf_rook`. The structural
  control flow (rook pivot search loop, P/K and KP/KK swaps, back-pivot
  loop in standard-form pass) is identical between the two — only the
  scalar arithmetic and BLAS calls change. Strong recommendation for any
  future `_rook` z-port: open the d-version side-by-side and translate
  blockwise rather than re-deriving from Fortran.
- Bunch-Kaufman 2x2 IPIV encoding uses negative 1-based values
  (`IPIV(K) = -P`). With JS bitwise NOT (`~(p-1) = -p`), the raw int
  value is preserved — use `~IPIV[i]` to decode, NOT `-IPIV[i] - 1`.
- The back-pivot loop at the tail of each path is load-bearing: it
  partially undoes the swaps applied during the panel factorization so
  that the returned panel is in standard L21/U12 form. `_rook` keeps
  this loop (unlike `_rk`, which uses a separate `e` vector and skips
  the standard-form pass).
- `cabs1(z) = |re| + |im|` is used everywhere instead of the true
  modulus `|z|` — this is the LAPACK convention for backward error
  norms and pivot magnitude tests. Do not substitute `Math.hypot`.

## Dependency interface surprises

- `zscal` takes a `Complex128` scalar (not a Float64 pair); construct
  `new Complex128(r1Re, r1Im)` even though it costs an allocation in
  the diagonal-divide hot path. The alternative would be to inline a
  bespoke scaled-copy, which is not justified for this routine.
- `cmplx.divAt(out, oo, a, oa, b, ob)` writes the result to `out[oo]`
  / `out[oo+1]`. It is safe to alias `a`/`b`/`out` to the same buffer
  as long as the source slots are read before the result slots are
  written (which `divAt` does correctly).
- `izamax` returns 0-based indices in JS (vs 1-based in Fortran). The
  pivot-search arithmetic (`imax = k + 1 + izamax(...)` in lower mode)
  matches the d-version exactly.

## Complex number handling

- For the 2x2 pivot D11/D22/D12/D21 arithmetic, every division was
  routed through `cmplx.div` per the project rule. Multiplications
  and the final scaled output were inlined as
  `(aRe*bRe - aIm*bIm) + i*(aRe*bIm + aIm*bRe)`.
- `T = 1 / (D11*D22 - 1)` was computed by inlining the multiply, then
  subtracting 1.0 from the real part, then routing through `cmplx.div`
  to invert. This three-step pattern is shared with `zlasyf_rk`.
- Direct Float64 access via `reinterpret(A, 0)` is used both for
  `cabs1` reads (avoids constructing temporary `Complex128`) and for
  the diagonal/off-diagonal scalar reads & writes inside the 1x1 / 2x2
  pivot blocks.

## Coverage gaps

- The "underflow divide" branch (`|akk| < SFMIN` but `akk != 0`) is
  unreachable with the well-conditioned fixtures used here. Same for
  `dlasyf_rook` and `zlasyf_rk`. To reach it would require pivot
  diagonals near machine underflow (~1e-308). Accepted as uncovered.
- The `jp1 !== jj && kstep === 2` arm of the lower back-pivot loop is
  also conditional on the specific pivot pattern emitted; the existing
  fixtures cover the upper version of this branch but not the lower.
  Final coverage: 98.4% line / 97.5% branch on `base.js`.
