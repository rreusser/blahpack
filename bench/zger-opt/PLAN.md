# zgeru / zgerc optimization plan

**Status: plan only.** No optimization work has been started. This document
sketches the most promising avenue so the study can be picked up and acted
on; it is a starting point for investigation, not committed intent.

## Routines

`lib/blas/base/zgeru` and `lib/blas/base/zgerc` — complex rank-1 updates
(`A += alpha*x*y^T` and `A += alpha*x*y^H`). Twins differing only by
conjugation of `y`, so one study covers both. `zgerc` is used in the complex
eigensolver path (`zggev`/`zhgeqz`), which gives this more weight than the
raw headroom ratio suggests.

## Measured signal

Exploratory probe session (2026-07-15): complex level-2 kernels run ~5–7 GF/s
against a ~9.4 GF/s roofline — **~1.5–2x hypothesized headroom**. The real
analog `dger` shipped 1.7–2.6x from 4-wide blocked rank updates, but was
memory-bound; the complex version does 4x the flops per byte, so expect less.
Baseline needs re-establishing in-tree.

## Most promising avenue

The `bench/dger-opt/` pattern: process 4 columns (or rows) per outer
iteration so each streamed element of `x` is reused against 4 cached values
of `alpha*y[j]`. Complex adaptations:

- Precompute `alpha*y[j]` (conjugated for zgerc) per block — 4 complex
  temporaries = 8 doubles, fine for register pressure.
- dger's win was **bit-identical** (no summation reordering — each `A[i,j]`
  gets exactly one fused update). The same property should hold here, which
  makes the correctness gate strict equality. Verify this early; it
  simplifies everything.
- Share one kernel between zgeru/zgerc via a conj flag resolved *outside*
  the loops, or generate two specializations — decide by measurement.

## Open questions

- Is the kernel still memory-bound enough for 4-wide reuse to matter, given
  complex flop density? (dger went 19–35 GB/s vs a ~40 GB/s ceiling; the
  complex version moves the same bytes with 4x the arithmetic.)
- Row-major vs col-major: dger's blocking was layout-adaptive; confirm the
  same fold works with doubled strides.

## Suggested investigation steps

1. Reproduce the baseline for both routines.
2. Copy the `bench/dger-opt/` harness; two v0 oracles (zgeru, zgerc),
   verbatim from lib.
3. Gate: elementwise over the FULL A storage (proves untouched entries are
   never written), bit-identical if the no-reordering property holds.

## References

- `bench/dger-opt/` — the direct template (shipped 1.7–2.6x, bit-identical).
- `bench/profile-zhgeqz.js` — consuming workload.
- `docs/complex-numbers.md`, `docs/optimization-policy.md`.
