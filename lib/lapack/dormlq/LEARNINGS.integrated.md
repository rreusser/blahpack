# dormlq: Translation Learnings

## Translation pitfalls

- dormlq is a direct real-valued analog of zunmlq. The translation was straightforward, replacing `'C'` (conjugate transpose) with `'T'` (transpose) in the `transt` variable, and using `Float64Array` instead of `Complex128Array`.
- No index off-by-ones encountered; the zunmlq implementation served as a reliable template.

## Dependency interface surprises

- dlarfb takes 2D strides for WORK (strideWORK1, strideWORK2) rather than a 1D stride. This differs from dorml2 which takes a 1D stride for WORK. Must pass `WORK, 1, ldwork, offsetWORK` to dlarfb.
- dlarft takes 2D strides for both V and T matrices, consistent with the dlarfb convention.

## Automation opportunities

- The blocked test fixture approach (saving factored A/TAU from Fortran, then loading in JS) is needed because JS `dgelqf` and Fortran `dgelqf` can produce subtly different factorizations (same mathematical result but different floating-point paths due to blocking). This pattern should be documented as standard practice for blocked routine tests.

## Coverage gaps

- Lines 120-123 (internal WORK reallocation when passed WORK is too small) are not exercised by tests. This is a safety fallback and is difficult to trigger in a meaningful test without deliberately passing an undersized buffer.
- 97.88% line coverage, 96.67% branch coverage achieved.

## Complex number handling

- N/A: dormlq is a real-valued routine. No complex arithmetic involved.
