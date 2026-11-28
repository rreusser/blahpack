# zgeequ: Translation Learnings

## Translation pitfalls
- Nearly identical to dgeequ but uses CABS1 (|re|+|im|) instead of abs() for complex elements
- Must reinterpret Complex128Array to Float64 view and double all strides/offsets for element access
- The CABS1 function operates on Float64 view indices (pairs of doubles), not complex element indices

## Dependency interface surprises
- N/A - leaf routine with no LAPACK dependencies (only dlamch)

## Missing automation
- The real-to-complex mirroring pattern (dgeequ -> zgeequ) is highly mechanical: replace abs() with cabs1(), add reinterpret(), double strides. Could be automated.

## Coverage gaps
- Lines 186-192 uncovered: the path where column scale factor is zero (M+j info return). Would need a matrix with an all-zero column after row scaling to trigger.

## Complex number handling
- CABS1 inlined as local function: |re(z)| + |im(z)| - safe to inline (just addition of absolute values)
- No complex division or absolute value needed
