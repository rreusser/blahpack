# drotmg: Translation Learnings

## Translation pitfalls

- drotmg has scalar in/out parameters (dd1, dd2, dx1) which cannot be passed by value in JavaScript. The API uses array+stride+offset for these parameters: `D` holds `[dd1, dd2]` and `x1` holds `[dx1]`. This differs from the signature.py output which assumed plain scalar parameters.
- The `else { if (...) }` pattern in the Fortran (lines 167-188) maps to `else if` in JavaScript per the `no-lonely-if` lint rule.
- The Fortran `DPARAM` array is 1-indexed (positions 1-5), but the JavaScript array is 0-indexed (positions 0-4). The mapping is preserved by the stride/offset convention.
- The quick-return path (`dp2 === 0.0`) must write `dflag` to `param` and return immediately, without writing back to `D` or `x1`. This matches the Fortran `RETURN` behavior where the subroutine exits before the end-of-routine writeback.

## Dependency interface surprises

- No dependencies (leaf BLAS routine). Only uses `@stdlib/math/base/special/abs`.

## Automation opportunities

- signature.py does not handle scalar in/out parameters correctly. For routines like drotmg where Fortran scalars are modified in place, the generated signature uses plain numbers instead of array+offset. A flag or heuristic for INTENT(INOUT) scalars would help.
- The gen_test.py scaffold generates TODO stubs that need substantial manual rewriting for routines with non-standard parameter patterns.

## Coverage gaps

- The `du <= 0` safety path (lines 107-117 in base.js) is a guard against rounding errors that is nearly impossible to trigger with normal inputs. This is by design (see DOI: 10.1145/355841.355847). Accepted as uncovered.
- The `dflag === 0` branch in the dd1 scale-check loop (lines 146-149) requires a case where the scale-check loop fires while dflag is still 0 (i.e., coming from the `|q1| > |q2|` path with a very small dd1 result). This would require carefully tuned inputs to trigger.
- The `dflag === 0` branch in the dd2 scale-check loop is similar. Both are 90% covered overall, meeting the threshold.

## Complex number handling

- N/A (real-valued BLAS routine).
