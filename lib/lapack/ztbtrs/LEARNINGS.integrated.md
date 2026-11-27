# ztbtrs: Translation Learnings

## Translation pitfalls

- The singularity check must test both real and imaginary parts of the diagonal element (both == 0.0), not just a single value like the real dtbtrs.
- When reinterpreting Complex128Array for the singularity check, the index must be multiplied by 2 to convert from complex element indices to Float64 indices.

## Dependency interface surprises

- ztbsv lives in blas/base (not lapack/base), so the require path goes through `../../../../blas/base/ztbsv/lib/base.js`.
- ztbsv takes strides in complex element units (not float64), consistent with all complex BLAS routines.

## Automation opportunities

- The Fortran test pattern for complex band matrices with EQUIVALENCE is very mechanical and could be templated.

## Coverage gaps

- 100% line, branch, and function coverage on base.js. All code paths exercised.

## Complex number handling

- Only reinterpret is needed for the singularity check. No complex arithmetic is performed in ztbtrs itself -- all actual computation is delegated to ztbsv.
- The Fortran ZERO comparison `AB(KD+1, INFO).EQ.ZERO` maps to checking both `ABv[idx] === 0.0 && ABv[idx+1] === 0.0` on the reinterpreted view.
