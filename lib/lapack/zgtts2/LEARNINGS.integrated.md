# zgtts2: Translation Learnings

## Translation pitfalls

- **Conjugate division bug**: Dividing by conj(D) = (dr,-di) requires `(cr*dr - ci*di, ci*dr + cr*di)/den`, NOT `(cr*dr + ci*di, ci*dr - cr*di)/den`. The sign flip on di propagates through both real and imaginary parts of the division formula. Initial implementation had `- ci * (-di)` which double-negates to `+ ci*di` instead of `- ci*di`.
- Three distinct branches (itrans=0,1,2) unlike the real version which has only two (itrans=0 vs 1/2 are identical for real). The conjugate transpose branch differs from plain transpose in that DL/DU/DU2/D are all conjugated.
- B strides are in Float64 elements (not complex elements) because B is reinterpreted. This differs from DL/D/DU/DU2 which use complex-element strides.

## Dependency interface surprises

- N/A -- leaf routine.

## Missing automation

- The Fortran NRHS<=1 optimization (single-column fast path with GOTO) is unnecessary in JS. Both paths are logically identical; the Fortran version uses GOTO for the single-column case as a micro-optimization.

## Coverage gaps

- Transpose (itrans=1) with pivoting is not explicitly tested but shares code structure with itrans=2.

## Complex number handling

- All complex multiplications and divisions are inlined. Division by D(i) uses standard `(ac+bd, bc-ad)/(c^2+d^2)` formula; division by conj(D(i)) flips the sign of the imaginary part of D.
- Conjugate of DL/DU/DU2 in the itrans=2 branch is computed by negating the imaginary part: `ai = -dlv[idl+1]`.
