# ztrtrs: Translation Learnings

## Translation pitfalls

- Singularity check requires comparing both real and imaginary parts to zero (unlike dtrtrs which only checks one scalar). The Fortran `A(INFO,INFO).EQ.ZERO` where ZERO=(0,0) checks both components.
- Diagonal element access uses Float64 indexing: `offsetA*2 + i*sa1 + i*sa2` where sa1/sa2 are already doubled.

## Dependency interface surprises

- ztrsm takes `Complex128` for alpha (not a plain number), and `Complex128Array` for A and B with complex-element strides. No surprises -- consistent with doc in dependency-conventions.md.

## Automation opportunities

- N/A -- ztrtrs is nearly identical to dtrtrs. The complex variant follows the same pattern with reinterpret and Complex128 alpha. No new mechanical steps beyond what dtrtrs already established.

## Coverage gaps

- N/A -- 100% line and branch coverage achieved. The routine is simple: quick return, singularity check, delegate to ztrsm. All paths covered.

## Complex number handling

- No complex arithmetic is performed in ztrtrs itself. The only complex operation is the singularity check (comparing diagonal elements to zero), done via Float64Array view.
- CONE = Complex128(1,0) is passed to ztrsm as the alpha scalar.
- The reinterpret pattern is used only for reading diagonal elements during the singularity check.
