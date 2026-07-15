# zgemv optimization plan

**Status: plan only.** No optimization work has been started. This document
sketches the most promising avenue so the study can be picked up and acted
on; it is a starting point for investigation, not committed intent.

## Routine

`lib/blas/base/zgemv` — complex general matrix-vector multiply
(`y = alpha*op(A)*x + beta*y`, op in {N, T, C}). Highest-leverage routine in
the complex level-2 family: the conjugate-transpose path is hot in the
complex eigensolver (`zggev`/`zhgeqz` — see `bench/profile-zhgeqz.js`), so a
win here propagates to a real workload in this repo.

## Measured signal

Exploratory probe session (2026-07-15): complex level-2 kernels run at
roughly 5–7 GF/s against a ~9.4 GF/s roofline on this machine, i.e.
**~1.5–2x hypothesized headroom** — much less than the real level-2 family
had, because complex arithmetic does ~4x the flops per byte and these kernels
were never as memory-starved. Baselines were measured in throwaway scripts;
re-establishing them in-tree is step one.

## Most promising avenue

The layout-adaptive 4-wide register blocking that shipped for `dgemv`
(2.0–2.6x; see `bench/dgemv-opt/`): fold the transpose op into logical
strides, then choose dot-form or axpy-form so the inner loop walks the
smaller stride. Complex-specific adaptations to investigate:

- Interleaved storage doubles every stride; a "4-wide" block holds 4 complex
  accumulators = 8 live doubles, which should still sit comfortably under
  V8's ~16-f64 spill threshold (measured in `bench/dgemm-opt/`).
- Three op modes instead of two: the conjugate-transpose path needs `conj(A)`
  folded into the inner product. Investigate whether a conj sign flag can be
  hoisted out of the inner loop without a per-element branch.
- `beta` scaling of complex `y` and the pure-real/pure-imaginary `alpha`
  special cases in the reference — decide whether to preserve or subsume them
  (faithfulness question for `docs/optimization-policy.md`).

## Open questions

- Does the dot-vs-axpy stride heuristic from dgemv carry over unchanged when
  every logical stride is 2x in doubles?
- Is the conjugate path worth its own specialized inner loop (it is the hot
  one in zhgeqz)?
- Complex multiply is 4 mul + 2 add; a 3-multiply (Gauss) form changes
  per-element *rounding*, not just summation order — likely off-policy.
  Confirm against `docs/optimization-policy.md` before trying it.

## Suggested investigation steps

1. Add zgemv to `bench/bench-opt-candidates.mjs` (or a dir-local probe) to
   reproduce the baseline GF/s and headroom ratio.
2. Copy the `bench/dgemv-opt/` harness; `variants/v0-reference.js` = current
   shipped kernel, verbatim.
3. Prototype the blocked kernel for op = C first (the workload-relevant
   path), then generalize.
4. Gate per `docs/optimization-policy.md`; verify against
   `bench/profile-zhgeqz.js` for end-to-end effect.

## References

- `bench/dgemv-opt/` — the direct template.
- `bench/profile-zhgeqz.js` — the consuming workload profile.
- `docs/complex-numbers.md` — interleaved-storage and arithmetic conventions.
- `docs/optimization-policy.md`, `docs/performance-patterns.md`.
