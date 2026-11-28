# zupgtr: Translation Learnings

## Translation pitfalls

- Direct translation from dopgtr (real counterpart). Main difference:
  Q and AP are Complex128Array, so element copies use doubled Float64
  view indices (offset * 2 for re, offset * 2 + 1 for im).
- The packed index traversal (ij += 2 to skip diagonal) is identical
  to the real case since packed storage uses the same layout for complex.

## Dependency interface surprises

- zung2l and zung2r use complex-element strides, same as all other
  complex LAPACK routines in this codebase.

## Automation opportunities

- The pattern of copying packed storage to a 2D matrix is shared with
  dopgtr. Could be abstracted but the complex case requires copying
  two floats per element.

## Coverage gaps

- Only N=0, 1, 4 tested. The N=4 case tests both upper and lower paths.

## Complex number handling

- Element copies from AP to Q use the Float64 view: `qv[oQ] = apv[oA]`
  for real part, `qv[oQ+1] = apv[oA+1]` for imaginary part.
- Zero elements set via `qv[oQ] = 0.0; qv[oQ+1] = 0.0`.
- One elements set via `qv[oQ] = 1.0; qv[oQ+1] = 0.0`.
- All reflector application delegated to zung2l/zung2r.
