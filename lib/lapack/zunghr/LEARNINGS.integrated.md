# zunghr: Translation Learnings

## Translation pitfalls

- Direct port from dorghr with complex arrays. The main difference is that every scalar zero/one must be written as two Float64 values (re + im).
- ILO and IHI remain 1-based in the JS API, matching Fortran convention. The column-shifting loop uses 0-based indices internally (j from ihi-1 down to ilo).
- The offset into the sub-matrix for the zungqr call uses complex-element strides (not Float64 strides), since zungqr expects Complex128Array with complex-element strides/offsets.

## Dependency interface surprises

- zungqr takes strides/offsets in complex elements (not Float64). The sub-matrix offset passed to zungqr is `offsetA + ilo*strideA1 + ilo*strideA2` in complex-element units, while the internal loops in zunghr convert to Float64 units (`*2`).
- zgehrd similarly uses complex-element strides/offsets.

## Automation opportunities

- The pattern of converting dorg* to zung* (real orthogonal to complex unitary) is mechanical: replace Float64Array with Complex128Array, add reinterpret, double all index arithmetic for Float64 views, write complex zero/one as two values. This could be a transform if more routines follow this pattern.

## Coverage gaps

- 100% line and branch coverage achieved. The N=0 quick return, N=1 trivial case, ILO=IHI (no reflectors), partial range, and full range cases cover all branches.

## Complex number handling

- No complex arithmetic needed in zunghr itself -- it only shuffles reflector vectors and sets identity columns. All complex math happens inside zungqr.
- Used `reinterpret()` at function entry to get Float64 view for direct element manipulation (setting zeros/ones, copying reflector vectors).
- Passed original Complex128Array (with complex-element strides) to zungqr.
