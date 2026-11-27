# zlaqge: Translation Learnings

## Translation pitfalls
- Mirror of dlaqge but operates on Complex128Array - scaling a complex number by a real scalar means multiplying both re and im parts
- Must access elements via Float64 view (reinterpret) and scale both components independently
- Return values use long-form strings ('none', 'row', 'column', 'both') matching the existing dlaqge convention

## Dependency interface surprises
- N/A - leaf routine with no LAPACK dependencies (only dlamch for SMALL/LARGE thresholds)

## Missing automation
- Same real-to-complex mirroring pattern as zgeequ. The scaling operation (real * complex = scale both parts) is the only difference from dlaqge.

## Coverage gaps
- 100% coverage in standalone zlaqge tests
- When called via zgesvx, only the 'both' path is exercised by the equilibration test

## Complex number handling
- Real-scalar times complex: `cj * Av[ia]` and `cj * Av[ia+1]` - safe to inline (just real multiplication)
- No complex-complex operations needed
