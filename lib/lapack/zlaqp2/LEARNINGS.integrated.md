# zlaqp2: Translation Learnings

## Routine Summary

- **Source**: `data/lapack-3.12.0/SRC/zlaqp2.f` (263 lines, 90 code body)
- **Complexity**: 0 GOTOs, nested loops with norm update
- **Dependencies**: zlarfg, zlarf, zswap, idamax, dznrm2, dlamch
- **Coverage**: 95.05% line, 90.00% branch

## Translation pitfalls

- The Fortran `OFFSET` parameter is 0-based in our JS (matching Fortran's semantics where OFFSET represents the number of already-factored rows). `OFFPI = OFFSET + I` (0-based) correctly maps to Fortran's `OFFPI = OFFSET + I` (1-based).
- The `DCONJG(TAU(I))` in the Fortran zlarf call requires creating a temporary conjugated tau array. This is done inline rather than via cmplx.conj to avoid allocation overhead.
- idamax returns a 0-based index. The pivot computation `pvt = i + idamax(N-i, VN1, 1, offsetVN1 + i)` correctly maps the sub-array result to the global column index.

## Dependency interface surprises

- **zlarfg bug found**: When alpha has zero real part (alphr=0), `Math.sign(0)` returns 0, causing `beta = 0` and subsequent division by zero (NaN). The Fortran SIGN(A,B) function returns `|A|*sign(B)` where sign(0)=+1 (implementation-dependent, but typically positive). Fixed by using `(Math.sign(alphr) || 1.0)` to default to positive sign when alphr=0. This was a pre-existing bug in zlarfg that was never triggered by previous test cases (which all had nonzero real parts for alpha).
- idamax takes a real array stride (not complex element stride), which is consistent since VN1/VN2 are real-valued arrays. No stride conversion needed.

## Automation opportunities

- N/A. The translation is mechanical. The norm update logic could potentially be extracted as a reusable transform, but it only appears in zlaqp2/zlaqps.

## Coverage gaps

- Lines 181-190: The `offpi >= M-1` branch in the norm recomputation sets VN1/VN2 to zero. This is triggered when the factored submatrix has only one remaining row (M - offset_i = 1), so no subdiagonal elements exist for norm recomputation. This edge case would require a very specific matrix size/content combination to trigger within the norm update loop (not the main zlarfg branch).

## Complex number handling

- Used `cmplx.abs()` for computing `|A(offpi, j)|` in the norm update formula. This computes the modulus of a complex number safely (avoiding overflow via the mx/mn technique).
- No complex division or multiplication was needed in the translation -- those operations are handled by the dependencies (zlarfg, zlarf).
- The norm update formula `VN1(j) = VN1(j) * sqrt(max(0, 1 - (|A(offpi,j)|/VN1(j))^2))` uses only real arithmetic on the absolute values.
