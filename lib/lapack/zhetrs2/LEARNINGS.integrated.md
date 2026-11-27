# zhetrs2: Translation Learnings

## Translation pitfalls
- Uses zsyconv to extract off-diagonal of D into WORK, then ZTRSM with conjugate-transpose.
- Hermitian 2x2 pivot solve: AKM1 = A(i-1,i-1)/AKM1K, AK = A(i,i)/conj(AKM1K). Diagonal is real, so first arg to cDiv has zero imaginary.
- Upper case: ZTRSM 'N' then D-solve backward, then ZTRSM 'C' (conjugate-transpose).
- Lower case: ZTRSM 'N' then D-solve forward, then ZTRSM 'C'.
- zsyconv is shared between symmetric and Hermitian paths; it works on the IPIV encoding regardless.

## Dependency interface surprises
- zsyconv takes 'C' (convert) or 'R' (revert) as second parameter.
- ztrsm takes long-form strings: 'conjugate-transpose' not 'C'.

## Missing automation
- N/A.

## Coverage gaps
- Tested indirectly through zhesv. Direct tests would improve coverage of 2x2 block solve path.

## Complex number handling
- cDiv used for all complex division in 2x2 block solve.
