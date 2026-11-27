# zsymv: Translation Learnings

## Translation pitfalls
- SYMMETRIC, not Hermitian. No conjugation anywhere. A(i,j)*x(i) uses plain complex multiply.
- alpha and beta are Complex128 objects; access .re and .im properties.
- Quick return when alpha=0 and beta=1 (not just N=0).
- Beta scaling applied before alpha*A*x computation.

## Dependency interface surprises
- N/A; standalone routine with no LAPACK dependencies.

## Missing automation
- N/A.

## Coverage gaps
- Tested upper with alpha=1/beta=0, lower with non-trivial alpha/beta, N=0, alpha=0/beta=1 quick return.
- Non-unit strides not explicitly tested (internal loop always uses unit stride pattern since strideX/strideY are consumed into Float64 offsets).

## Complex number handling
- All complex arithmetic inlined: multiply, add, scale. No division needed.
