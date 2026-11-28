# zhpgv: Translation Learnings

## Translation pitfalls

- The backtransform uses 'conjugate-transpose' instead of 'transpose' (as in the real dspgv). In Fortran, the complex version uses TRANS='C' where the real version uses TRANS='T'. This is the key difference from the real counterpart.
- The RWORK (Float64Array) and WORK (Complex128Array) workspace split must be threaded through to zhpev.

## Dependency interface surprises

- zhpev uses 'compute-vectors'/'no-vectors' as the jobz convention, matching the zhpgv caller (no translation needed, unlike dspgv -> dspev which translates 'compute-vectors' to 'compute').
- zpptrf, zhpgst, ztpsv, ztpmv all use complex-element strides and offsets consistently.

## Automation opportunities

- The pattern of zhpgv mirroring dspgv with s/d/z replacements and transpose->conjugate-transpose is highly mechanical and could be templated.

## Coverage gaps

- No test for partial convergence failure (info > 0 but < N from zhpev).
- The itype 2/3 paths with upper/lower both tested, covering all 6 major code paths.

## Complex number handling

- No direct complex arithmetic in zhpgv. All complex operations are delegated to zpptrf, zhpgst, zhpev, ztpsv, ztpmv.
- The eigenvalues (w) are real Float64Array despite complex input matrices.
