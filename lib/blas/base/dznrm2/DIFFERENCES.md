# dznrm2: Differences from the Reference Implementation

## [OPTIMIZATION] base.js — fast path ahead of Blue's scaled algorithm

The reference (BLAS 3.12.0 `dznrm2.f90`) computes the complex Euclidean norm
with Blue's three-accumulator scaled algorithm unconditionally, classifying
every real and imaginary component by magnitude. Our `base.js` first computes
the plain (unscaled) sum of squares of the interleaved real/imaginary
components in four independent accumulators and returns `sqrt(sumsq)` when the
sum lies in `(1.0e-140, 1.0e+140)`; otherwise it falls back to a verbatim
translation of the reference scaled algorithm. This mirrors the shipped
`dnrm2` optimization — a complex norm is just a sum of squares over the
interleaved storage.

- **Verification tier**: backward error (the fast path reorders the
  summation; see `docs/optimization-policy.md`). Gated against the preserved
  reference kernel at rel. tol. `1e-14` over 962 cases in
  `bench/dznrm2-opt/check.mjs`. Inputs that take the fallback (any
  over/underflow risk, NaN, Inf in either component) are required to match
  the reference **bit-identically** — the fallback is the unmodified
  reference loop.
- **Why the window is safe**: inside it no partial sum can have overflowed
  (`Inf` fails the upper bound; NaN fails both), and squares lost to
  underflow (< 2^-1074 each) are negligible relative to `1.0e-140`. The
  window bounds the combined re²+im² sum, so a huge component in either part
  fails the check and takes the scaled fallback.
- **Cost**: inputs that need the scaled algorithm now pay one wasted pass
  (~0.87x the reference speed — the same deliberate trade `dnrm2` makes).
  Normal-range inputs are ~3.0x (stride 1) / ~2.7x (strided) faster;
  measured in `bench/dznrm2-opt/bench.mjs`.
- **Oracle preserved**: `bench/dznrm2-opt/variants/v0-reference.js`.
