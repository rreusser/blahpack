# zlasyf_rk: Translation Learnings

## Translation pitfalls

- **Symmetric, not Hermitian — no conjugation, no diagonal-realness.** Adapted from zlahef_rk by removing every `zlacgv` call, all `wv[...+1] = 0.0` diagonal-realness stores, and the conjugation pattern in the 2x2 formulas. `absakk = cabs1(W(k,kw))` instead of `|real(W(k,kw))|`, and the diagonal copy into A preserves the full complex value.
- **`zscal` takes a `Complex128` scale, not a real.** The 1x1 pivot uses `zscal(k, new Complex128(r1Re, r1Im), A, ...)`, computing `r1 = 1/A(k,k)` via `cmplx.divAt`. Compare to zlahef_rk which uses `zdscal(k, 1/diagRe, ...)` because the Hermitian diagonal is guaranteed real.
- **`cmplx.divAt` scratch layout.** Reuse a single `Float64Array(6)` `tmp` throughout: slots 0..1 are the numerator, 2..3 are the denominator, 4..5 are the result. All complex divisions (`1/A(k,k)`, `D11 = W(k,kw)/D12`, `D22 = W(k-1,kw-1)/D12`, `T = 1/(D11*D22 - 1)`, inline A(j,k-1) /= D12) go through this single buffer. Avoids allocating `Complex128` objects in hot loops.
- **2x2 formula pattern: multiply by T, divide by D12.** The Fortran code is `A(J, K-1) = T*((D11*W(J,KW-1) - W(J,KW)) / D12)`. In JS I compute `a - wjk`, then `cmplx.divAt(tmp, 4, numIdx, d12Idx)` to get `/D12`, then multiply the result by the precomputed complex `T` via inlined multiplication. Don't try to fold `T/D12` into one scalar like zlasyf (non-rk) does — the `_rk` variant keeps them separate to match the Fortran structure and to simplify debugging.
- **The 2x2 A off-diagonal is zeroed, not stored.** Same as dlasyf_rk / zlahef_rk: `A(k-1, k) = CZERO` (upper) and `A(k+1, k) = CZERO` (lower); the off-diagonal lives in `E` as `E(k) = W(k-1, kw)` / `W(k+1, k)`.
- **Lower-case loop termination uses `k >= nb - 1`, not `k >= nb`.** The same 1-based-to-0-based translation landmine as dlasyf_rk and zlahef_rk. Keep it consistent across all three.

## Dependency interface surprises

- **`zscal` takes `Complex128`, `zdscal` takes `number`.** The symmetric path uses `zscal`; Hermitian uses `zdscal`. Both take complex vectors as `Complex128Array` with complex-element strides.
- **`cmplx.divAt(out, oi, a, ai, b, bi)` is robust (Baudin-Smith).** Always use `divAt` for complex division in hot loops; never inline `(re*re + im*im)` denominators.

## Testing

- Complex symmetric test matrices are tricky to construct because the `(i,j)` and `(j,i)` entries must be equal (no conjugation). Used the same `buildMatrix(n, entries)` helper as zlahef_rk, supplying `(i, j, re, im)` tuples only for the triangular region that `uplo` selects; the routine never touches the opposite triangle.
- Diagonal entries are fully complex (e.g., `(0.01, 0.01)`) — this exercises the non-real diagonal paths that distinguish the symmetric variant from the Hermitian one.

## Gate config exceptions

Added `lib/lapack/base/zlasyf_rk` exception for `scaffolding.no-todo-readme`, `scaffolding.index-example`, and `tests.assertion-count`, with the same rationale as `dlasyf_rk` / `zlahef_rk`.
