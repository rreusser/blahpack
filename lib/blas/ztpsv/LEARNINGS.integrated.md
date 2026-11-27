# ztpsv: Translation Learnings

## Translation pitfalls

- Complex division with conjugation: cannot simply negate the imaginary part
  in-place on the AP array since AP should be read-only. Used a module-scoped
  scratch Float64Array(2) to hold the conjugated denominator for `cdivAt` calls
  in the conjugate-transpose branches.
- The `cdivAt` function operates on Float64Array indices and cannot take inline
  conjugated values. A scratch buffer is the cleanest approach without mutating
  the input packed matrix.
- The zero-check for complex elements requires checking both real and imaginary
  parts: `xv[jx] !== 0.0 || xv[jx+1] !== 0.0`, not just one component.

## Dependency interface surprises

- ztpmv (the multiply counterpart) was already implemented with the same
  Complex128Array + complex-element stride convention. The round-trip test
  pattern (ztpmv then ztpsv) worked perfectly for fixture-based testing.
- The `cmplx.divAt` interface `(out, oi, a, ai, b, bi)` is index-based,
  so conjugation of the denominator requires either mutating the source
  array or using a temporary buffer. Scratch buffer is preferred.

## Automation opportunities

- N/A -- the init_routine.py scaffold was already in place, gen_test.py
  generated the test skeleton correctly.

## Coverage gaps

- N/A -- achieved 100% line and 100% branch coverage on base.js.

## Complex number handling

- Used `cmplx.divAt` for all complex divisions (non-unit diagonal cases).
  Never inlined complex division, per project rules.
- Complex multiplication in the substitution loops was safely inlined:
  `(tr*ar - ti*ai)` for real part, `(tr*ai + ti*ar)` for imaginary part.
- Conjugation for A^H branches simply negates `ai = -APv[ip+1]` before
  the standard complex multiply formula.
