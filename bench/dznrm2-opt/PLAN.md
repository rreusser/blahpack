# dznrm2 optimization plan

**Status: plan only.** No optimization work has been started. This document
sketches the most promising avenue so the study can be picked up and acted
on; it is a starting point for investigation, not committed intent.

## Routine

`lib/blas/base/dznrm2` — Euclidean norm of a complex vector stored as
interleaved re/im doubles. Structurally the same problem as `dnrm2`: the
shipped kernel is Blue's three-accumulator scaled algorithm, dominated by
per-element magnitude classification rather than arithmetic.

## Measured signal

An exploratory probe session (2026-07-15, throwaway prototype, not preserved)
measured **~3.1x** over the shipped kernel with ~1.2e-15 relative error vs
the reference — consistent with the reassociated-summation error budget.
Recreating that prototype in-tree is the first step; treat the 3.1x as a
hypothesis to reconfirm, not an established result.

## Most promising avenue

The same transformation already shipped for `dnrm2` (see `bench/dnrm2-opt/`
and that module's `DIFFERENCES.md`): a plain unscaled sum of squares guarded
by a magnitude window, falling back to the *untouched* Blue's-algorithm loop
whenever any component lies outside the safe window (or the plain sum
over/underflows). For complex data the fast path sums `re^2 + im^2` over the
interleaved storage — for `stride == 1` this is exactly `dnrm2` over `2N`
contiguous doubles, which suggests the dnrm2 fast path may transfer nearly
verbatim.

## Open questions

- Can the `stride == 1` case literally reuse the dnrm2 fast-path loop over a
  flat `2N` view, or does the windowing guard need per-complex-element
  structure?
- Where should the window guard live for strided access — per component, or
  on the running sum with a post-hoc validity check (the dnrm2 approach)?
- How much of `bench/dnrm2-opt/`'s `check.mjs` two-tier gate (bit-identical
  fallback path, rtol fast path — per `docs/optimization-policy.md`) can be
  copied wholesale? Expectation: most of it.

## Suggested investigation steps

1. Copy `bench/dnrm2-opt/` (`check.mjs`, `bench.mjs`, variants layout) and
   adapt inputs to interleaved complex.
2. `variants/v0-reference.js` = current `lib/blas/base/dznrm2/lib/base.js`,
   verbatim, as the oracle.
3. `variants/v1-fastpath.js` = window-guarded plain sum with untouched
   fallback.
4. Gate: bit-identical on inputs that take the fallback (denormals, huge
   values, NaN/Inf in re or im independently, mixed magnitudes); documented
   rtol on the fast path. Sweep N, strides, offsets.

## References

- `bench/dnrm2-opt/` — the direct template (shipped 5.2x).
- `docs/optimization-policy.md` — what may change; two-tier correctness gate.
- `docs/performance-patterns.md` — fast-path/fallback pattern write-up.
