# dgeqp3: Translation Learnings

## Translation pitfalls

- **dormqr string convention:** dormqr expects lowercase stdlib-js strings (`'left'`, `'transpose'`), not the Fortran-style `'Left'`/`'Transpose'`. The zunmqr implementation accepts both (`side === 'left' || side === 'L'`), but dormqr only accepts the lowercase form. This caused silent incorrect results (not an error) because dormqr treated the unrecognized string as the default `right`/`no-transpose`.
- **ILAENV NX crossover point:** The Fortran `ILAENV(3, 'DGEQRF', ...)` returns NX=128, meaning the blocked dlaqps path is only used when `sminmn > 128`. Setting NX=0 (as zgeqp3 does) causes the blocked path to trigger much earlier, which works correctly but doesn't match Fortran behavior for intermediate matrix sizes. For dgeqp3, we use DEFAULT_NX=128 to match the Fortran.
- **Pivot tie-breaking:** Column norms with identical values (due to periodic matrix formulas like `mod(i*j+3,7)-3`) cause divergent pivot orders between JS and Fortran implementations. This is because `idamax` may break ties differently. Use transcendental functions (sin/cos) or irregular patterns for test matrices to avoid tied norms.
- **JPVT convention:** Both dgeqp3 and zgeqp3 output 1-based JPVT values in base.js (matching Fortran convention). dlaqp2/dlaqps only swap JPVT entries -- the caller (dgeqp3) initializes them.

## Dependency interface surprises

- **dormqr expects lowercase strings:** Unlike zunmqr which accepts both `'L'`/`'left'`, dormqr only accepts `'left'`/`'transpose'`/`'no-transpose'`. This inconsistency between the real and complex variants should be documented in dependency-conventions.md.
- **WORK allocation:** dgeqp3 allocates all workspace internally (VN1, VN2, F, AUXV, workQR), removing WORK/LWORK from the JS API. This matches the pattern in zgeqp3.

## Automation opportunities

- N/A -- the translation closely followed zgeqp3 as a template. The primary adaptation was replacing complex types/operations with real equivalents.

## Coverage gaps

- 100% line and branch coverage achieved on base.js.
- The 140x130 test exercises the blocked dlaqps path (sminmn=130 > NX=128).
- Fixed column tests exercise Phase 2 (dgeqrf + dormqr on fixed columns).

## Complex number handling

- N/A -- dgeqp3 is a real (double precision) routine. No complex arithmetic needed.
