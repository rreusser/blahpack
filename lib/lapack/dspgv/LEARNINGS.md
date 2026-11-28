# dspgv: Translation Learnings

## Translation pitfalls

- The Fortran loops over columns of Z (1-based J=1..NEIG), calling dtpsv/dtpmv on Z(1,J). In JS, Z is column-major with strideZ1=1, strideZ2=N, so column J (0-based) starts at offsetZ + j*strideZ2. The backtransform loop uses `offsetZ + ( j * strideZ2 )`.
- dspev uses `'compute'`/`'none'` for its jobz parameter, while dspgv exposes `'compute-vectors'`/`'no-vectors'` to match the newer stdlib-js convention. The mapping happens at the dspev call site.

## Dependency interface surprises

- dspgst returns 0 (always succeeds), so its return value is unused in the Fortran reference. The JS implementation ignores it too.
- dpptrf returns 1-based column index on failure; the Fortran reference adds N to shift it into a distinct range from dspev errors.

## Automation opportunities

- The packed-storage eigenvalue driver pattern (dpptrf + dspgst + dspev + backtransform) is identical for all packed generalized eigensolvers. Could template the backtransform logic.

## Coverage gaps

- Partial convergence (dspev returning info > 0 but < N) is not tested because it requires specially crafted matrices. The NEIG = info - 1 path is exercised only if dspev partially fails.

## Complex number handling

- N/A: dspgv is a real-valued routine.
