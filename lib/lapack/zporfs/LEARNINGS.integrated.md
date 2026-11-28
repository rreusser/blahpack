# zporfs: Translation Learnings

## Translation pitfalls

- Mirrors dporfs closely but uses zhemv instead of dsymv, zcopy/zaxpy instead of dcopy/daxpy.
- The CABS1 function (|re(z)| + |im(z)|) is used for componentwise error bounds, not cabs (complex modulus). This is the Fortran convention for iterative refinement bounds.
- For the Hermitian diagonal, use `Math.abs(Av[real_idx])` (real part only), not cabs1 of the full complex entry.
- WORK is Complex128Array of length 2*N (used as both work vector and V for zlacn2). RWORK is Float64Array of length N.
- zpotrs call within the refinement loop: pass `N * strideWORK` as strideB2 for the single-column solve.

## Dependency interface surprises

- zhemv uses Complex128 scalars (alpha, beta), not Float64. Need `new Complex128(1,0)` and `new Complex128(-1,0)`.
- zlacn2 takes Complex128Array with complex-element strides. The V and X parameters carve out the WORK array at different offsets.

## Automation opportunities

- zporfs/dporfs share >90% structure. A template parameterized on real/complex could generate both.

## Coverage gaps

- 96% line coverage. Uncovered lines are the kase=2 branch of zlacn2 reverse-communication (lines 236-243) and the safe1 fallback path. These are hard to trigger with well-conditioned test matrices.

## Complex number handling

- Uses cabs1 (|re|+|im|) inline helper for componentwise bounds.
- All complex arithmetic is via BLAS calls (zhemv, zaxpy, zcopy) or real-scalar * complex element (safe to inline).
- No complex division or square root needed.
