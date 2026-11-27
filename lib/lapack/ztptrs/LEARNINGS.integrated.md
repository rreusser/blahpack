# ztptrs: Translation Learnings

## Translation pitfalls

- The Fortran singularity check compares complex diagonal elements against
  complex zero using `AP(JC).EQ.ZERO`. In JS this requires checking both real
  and imaginary parts: `APv[ip] === 0.0 && APv[ip+1] === 0.0`. Using
  `reinterpret` to get the Float64Array view is necessary for this check.
- The diagonal indexing logic for packed storage differs between upper and
  lower: upper diag at column j is at packed index `jc + j`, lower diag is
  at `jc` (the first element of each column group).

## Dependency interface surprises

- `ztpsv` takes strides and offsets in complex elements (not doubles), which
  matches the convention used by ztptrs. No stride conversion needed when
  passing through to ztpsv.

## Automation opportunities

- None identified. The routine is a thin wrapper around ztpsv with a
  singularity pre-check, so translation was straightforward.

## Coverage gaps

- None. 100% line and branch coverage on base.js.

## Complex number handling

- The singularity check uses `reinterpret` to access the Float64Array
  backing the Complex128Array, checking both real and imaginary parts of
  diagonal elements.
- No complex arithmetic is performed directly in ztptrs; all complex
  solve work is delegated to ztpsv.
- The Fortran 'T' (transpose) and 'C' (conjugate-transpose) options both
  map through; for complex matrices, 'conjugate-transpose' is the typical
  operation rather than plain 'transpose'.
