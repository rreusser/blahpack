# zpprfs: Translation Learnings

## Translation pitfalls

- Fortran uses 1-based packed indexing with `KK` tracking the current position in AP. Translating to 0-based required careful bookkeeping of the `kk` accumulator: upper uses `kk += k + 1`, lower uses `kk += N - k`.
- The residual computation reuses the WORK array for two segments (w0 and w1), each of length N. The offset arithmetic must account for `strideWORK` when computing w1 = offsetWORK + N*strideWORK.
- The stopping criterion `s > EPS && 2*s <= lstres && count <= ITMAX` must match Fortran exactly. The `lstres` variable is initialized to 3.0 (not 1.0) to ensure the first iteration always runs.

## Dependency interface surprises

- zhpmv (Hermitian packed matrix-vector multiply) uses complex-element strides/offsets, matching zpprfs's convention. No stride conversion needed.
- zlacn2 uses reverse-communication with KASE/ISAVE/EST arrays. KASE and ISAVE are Int32Array, EST is Float64Array. The loop pattern is: call zlacn2, check KASE[0], if nonzero do multiply and loop again, if zero break.
- zpptrs third-to-last argument is the stride of the second dimension (LDB equivalent), not an offset. Must pass `N * strideWORK` as strideB2 when solving with WORK as the RHS.

## Automation opportunities

- The CABS1 inline function (|re| + |im|) appears in many z-prefix refinement routines. Could be extracted to a shared utility.

## Coverage gaps

- The iterative refinement loop (count > 1) is only exercised when the initial solution has sufficient error. Fixture data must provide cases with enough perturbation to trigger multiple refinement steps.
- The safe1/safe2 guarded branches in BERR and FERR computation are difficult to trigger with well-conditioned test matrices. Would require near-underflow element values.

## Complex number handling

- All element-level complex access uses reinterpret() to get Float64 views, then indexes at 2*i and 2*i+1 for real and imaginary parts.
- CABS1 (|re| + |im|) is inlined as a private helper rather than using a library call, matching the Fortran statement function pattern.
- The diagonal of a Hermitian matrix contributes only its real part (imaginary part is zero by definition), handled by `abs(APv[pa])` without the imaginary component.
- CONE and NCONE are allocated once as module-level Complex128 constants for zhpmv and zaxpy alpha/beta arguments.
