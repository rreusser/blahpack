# zlahef: Translation Learnings

## Translation pitfalls
- Hermitian panel factorization. W(k,kw) must be forced real after ZGEMV update.
- zlacgv must be called on W columns when copying row data into column form (row of A -> column of W requires conjugation for Hermitian).
- 2x2 pivot: D11 = W(k,kw)/conj(D21), D22 = W(k-1,kw-1)/D21. These divisions produce complex results but TT = real(D11*D22)-1 is real.
- D21 = T/D21 uses real T divided by complex D21.
- After 2x2 factorization, must conjugate W columns with zlacgv before they're used in subsequent ZGEMM/ZGEMV trailing updates.
- Copy-back to A forces diagonal elements real (imaginary = 0).

## Dependency interface surprises
- zlacgv operates in-place on complex array via stride/offset.

## Missing automation
- The pattern is nearly identical to zlasyf but with ~30 conjugation/real-forcing changes. Could be automated as a "symmetrize-to-hermitianize" transform.

## Coverage gaps
- Tested indirectly through zhetrf. Direct testing of zlahef with explicit NB control would improve coverage.

## Complex number handling
- Complex division for D21 computed manually as T*conj(D21)/|D21|^2 to avoid cmplx.div overhead.
