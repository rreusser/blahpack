# zlascl2: Translation Learnings

## Translation pitfalls

- Straightforward routine with no index pitfalls. The only subtlety is converting complex-element strides/offsets to Float64 strides/offsets (multiply by 2) when using `reinterpret()`.
- D is a real (Float64Array) vector, not complex, so no reinterpret needed for D.

## Dependency interface surprises

- N/A -- zlascl2 has no dependencies (leaf routine).

## Automation opportunities

- The d-prefix to z-prefix port for simple scaling routines (dlascl2 -> zlascl2) could be automated: the only changes are adding `reinterpret()`, doubling strides/offsets, and scaling both real and imaginary parts. The pattern is identical for any real-scalar-times-complex-element operation.

## Coverage gaps

- N/A -- 100% line, branch, and function coverage achieved. The routine has no conditional branches beyond the loop bounds.

## Complex number handling

- Only real-scalar times complex-element multiplication is needed, which is safe to inline: `Xv[ix] *= di; Xv[ix+1] *= di;`. No complex division, absolute value, or other unsafe operations.
- X uses Complex128Array with complex-element strides at the API boundary; inside base.js, `reinterpret(X, 0)` provides a Float64Array view with doubled strides/offsets.
