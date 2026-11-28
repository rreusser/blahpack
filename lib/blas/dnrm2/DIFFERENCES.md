# dnrm2: Differences from the Reference Implementation

## [OPTIMIZATION] base.js — fast path ahead of Blue's scaled algorithm

The reference (BLAS 3.12.0 `dnrm2.f90`) computes the norm with Blue's
three-accumulator scaled algorithm unconditionally. Our `base.js` first
computes the plain (unscaled) sum of squares in four independent
accumulators and returns `sqrt(sumsq)` when the sum lies in
`(1.0e-140, 1.0e+140)`; otherwise it falls back to a verbatim translation
of the reference scaled algorithm.

- **Verification tier**: backward error (the fast path reorders the
  summation; see `docs/optimization-policy.md`). Gated against the
  preserved reference kernel at rel. tol. `1e-14` over 948 cases in
  `bench/dnrm2-opt/check.mjs`. Inputs that take the fallback (any
  over/underflow risk, NaN, Inf) are required to match the reference
  **bit-identically** — the fallback is the unmodified reference loop.
- **Why the window is safe**: inside it no partial sum can have overflowed
  (`Inf` fails the upper bound; NaN fails both), and squares lost to
  underflow (< 2^-1074 each) are negligible relative to `1.0e-140`.
- **Cost**: inputs that need the scaled algorithm now pay one wasted pass
  (~0.8x the reference speed). Normal-range inputs are ~5x (stride 1) /
  ~3x (strided) faster; measured in `bench/dnrm2-opt/bench.mjs`.
- **Oracle preserved**: `bench/dnrm2-opt/variants/v0-reference.js`.
