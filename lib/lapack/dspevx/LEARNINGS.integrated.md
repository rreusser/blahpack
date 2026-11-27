# dspevx: Translation Learnings

## Translation pitfalls

- Workspace partitioning: Fortran uses 1-based indices (INDTAU=1, INDE=INDTAU+N, etc.) while JS uses 0-based offsets (indtau=offsetWORK, inde=indtau+N, etc.). The offset arithmetic is straightforward since WORK stride is always 1 in practice.
- The `out.M` output pattern (returning M via an object property) matches dsyevx convention since M is an output scalar.
- The N=1 special case must handle all three RANGE modes correctly, including the half-open interval semantics for RANGE='value' (vl < AP[0] && vu >= AP[0]).

## Dependency interface surprises

- dopmtr (packed orthogonal transform) replaces dormtr (full storage) from dsyevx. The calling convention is similar but uses packed AP storage instead of full A matrix with strides.
- dopgtr (generate orthogonal matrix from packed storage) replaces dorgtr from dsyevx. Same pattern of packed vs full storage.
- dstebz returns M and nsplit as Int32Array(1) output buffers, not as return values.

## Automation opportunities

- The lint-fix.sh script overwrites test/test.js with examples/index.js content (codemod-tests.js). Need to run gen_test.py or write tests manually after lint-fix.

## Coverage gaps

- Error return paths (info > 0 from dstein for non-convergence) are not tested since they require specially constructed ill-conditioned matrices.
- The fallthrough path (dsteqr/dsterf failure leading to dstebz path) is difficult to trigger in practice.

## Complex number handling

- N/A: dspevx is a real-valued routine.
