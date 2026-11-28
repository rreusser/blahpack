# dspgvx: Translation Learnings

## Translation pitfalls

- Like dspgv, the backtransform loop iterates over M eigenvectors (not N), where M is the number found by dspevx. When info > 0, M is set to info - 1 for the backtransform only (original M from dspevx is preserved in out.M).
- dspevx uses the `out.M` object pattern to return the number of eigenvalues found, and dspgvx must initialize `out.M = 0` before calling dspevx and also before quick-return paths.

## Dependency interface surprises

- dspevx uses `'compute-vectors'`/`'no-vectors'` for jobz, matching the stdlib-js convention directly (unlike dspev which uses `'compute'`/`'none'`). No mapping needed.
- dspgvx is a thin wrapper: dpptrf + dspgst + dspevx + backtransform. WORK/IWORK/IFAIL are passed through to dspevx.

## Automation opportunities

- The packed generalized eigenvalue driver pattern (dpptrf + dspgst + solver + backtransform) is shared by dspgv, dspgvx, and their complex counterparts. Could be templated.

## Coverage gaps

- Partial convergence (dspevx returning info > 0) is not tested; would require specially crafted matrices where dstein fails on some eigenvectors. The `M = info - 1` path in the backtransform is only exercised in that case.

## Complex number handling

- N/A: dspgvx is a real-valued routine.
