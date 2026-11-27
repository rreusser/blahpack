# zgels: Translation Learnings

## Translation pitfalls

- zgels is a direct mirror of dgels with 'conjugate-transpose' replacing 'transpose'. The mapping is straightforward: zgeqrf/zgelqf/zunmqr/zunmlq/ztrtrs/zlange/zlascl/zlaset replace their d-prefix counterparts.
- Zeroing out B rows (B(N+1:M) or B(M+1:N)) requires using the Float64 view (Bv = reinterpret(B, 0)) and setting both real and imaginary parts to 0. Complex stride conversion: bi = (complexOffset) * 2, step by strideB1 * 2.
- The Fortran uses WORK(1) through WORK(MN) for TAU and WORK(MN+1) onwards for workspace. In JS, we allocate a separate TAU array and pass WORK directly to subroutines.

## Dependency interface surprises

- ztrtrs uses long-form strings: 'upper', 'lower', 'no-transpose', 'conjugate-transpose', 'non-unit'. This matches the convention in dtrtrs.
- zlange with 'max' norm returns a real scalar (Float64), even though the matrix is complex.
- zlascl takes real scalars (cfrom, cto) for scaling, not Complex128.
- zlaset takes Complex128 objects for alpha and beta.
- zunmqr/zunmlq use 'no-transpose' and 'conjugate-transpose' (not 'N'/'C').

## Automation opportunities

- The dgels -> zgels translation is highly mechanical: swap d-prefix deps for z-prefix, change 'transpose' to 'conjugate-transpose', change Float64Array to Complex128Array, add reinterpret() for element access. A transform could automate this for any real -> complex driver routine.

## Coverage gaps

- 89% line coverage, 66% branch coverage. Uncovered branches are all scaling paths (iascl=1/2, ibscl=1/2) which require input matrices with elements near underflow (smlnum) or overflow (bignum) thresholds. These are systematically hard-to-cover paths that would require extreme floating-point values.
- The anrm === 0.0 all-zero matrix path is also uncovered.

## Complex number handling

- API uses Complex128Array for A, B, WORK, TAU. Strides and offsets are in complex elements.
- reinterpret(B, 0) used only for zeroing out B rows (direct Float64 access for setting zeros). All other operations go through Complex128Array-based subroutine calls.
- CZERO = new Complex128(0.0, 0.0) hoisted to module scope for zlaset calls.
- Machine constants (smlnum, bignum) computed from dlamch at module scope (real-valued).
