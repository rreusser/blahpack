# zgemv: Differences from the Reference Implementation

## [OPTIMIZATION] base.js — layout-adaptive 4-wide register-blocked kernel

The reference (BLAS 3.12.0 `zgemv.f`) walks `op(A)` with a scalar inner loop:
one axpy column pass for the no-transpose op, one dot column pass for the
transpose/conjugate-transpose ops. Our `base.js` folds all three ops into a
single layout-adaptive kernel modeled on the shipped real `dgemv`
optimization:

- **Transpose folded into logical strides.** With `B = op(A)` (a
  `leny`-by-`lenx` logical matrix), the transpose is absorbed into a swap of
  the two logical strides `(sb1, sb2)`. The kernel then picks whichever of two
  forms walks B's smaller-stride dimension in the inner loop — **dot form**
  (four complex row-accumulators) when `|sb2| <= |sb1|`, else **axpy form**
  (four complex `x` multipliers fused into one `y` update) — and
  register-blocks the other dimension four wide. Four complex accumulators =
  eight live doubles, comfortably under V8's ~16-f64 spill threshold.
- **Conjugate folded into the accumulation, not a per-element multiply.** The
  `A**H` op flips the sign of the imaginary product terms. That sign is
  applied by branching on a hoisted `noConj` flag *once, outside* the inner
  loop, into a conjugated vs. non-conjugated inner loop body — never as a
  per-element `* (±1)` multiply (which measured ~25% slower on the hot
  conjugate-transpose path).
- **Beta and alpha handling preserved.** `beta*y` is applied first exactly as
  the reference (the `beta = 0`, `beta = 1`, and general complex cases), and
  the full complex `alpha` multiply and both quick returns
  (`alpha = 0 && beta = 1`; `alpha = 0` after beta) are retained verbatim. The
  interleaved real/imag storage means every logical stride is expressed in
  doubles (2x the complex stride).

- **Verification tier**: backward error (the blocked forms reorder the
  reduction summation; see `docs/optimization-policy.md`). Gated against the
  preserved reference kernel with a NaN-aware relative tolerance
  (`1e-13 * max(4, lenx)`) over the full `y` storage across **6120 cases** in
  `bench/zgemv-opt/check.mjs`: all three ops (N/T/C); complex alpha/beta
  including `{0, 1, general, pure-imaginary}`; column/row/general/negative A
  strides; strided and negative x/y strides; non-square shapes; and M/N
  spanning the 4-wide remainder (0,1,2,3,4,5,7,8,17,33,64,100).
- **Why safe**: complex multiply remains the faithful 4-mul/2-add form (no
  Gauss/Karatsuba, which would change per-element rounding). Only the order of
  independent summands and the point at which `alpha` is applied change — the
  backward-error tier this repo already uses for `dgemm`/`dgemv`.
- **Measured ratios** (`bench/zgemv-opt/bench.mjs`, speedup vs. reference):
  1.46–2.01x across sizes and layouts; the workload-relevant
  conjugate-transpose (C) path is 1.50–1.84x. Row-major large shapes benefit
  most (~1.8–2.0x); column-major is ~1.5–1.6x.
- **Oracle preserved**: `bench/zgemv-opt/variants/v0-reference.js`.
