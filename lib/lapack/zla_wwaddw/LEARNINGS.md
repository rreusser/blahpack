# zla_wwaddw: Translation Learnings

## Translation pitfalls

- The Fortran operates on COMPLEX*16 values directly, but in JS we must decompose into real and imaginary parts. The doubled-single rounding step `S = (S + S) - S` applies independently to each component since complex addition is component-wise. This is a straightforward decomposition with no cross-term interaction.
- The `reinterpret()` pattern with stride/offset `* 2` conversion is mechanical from the d-prefix counterpart. No index off-by-one risk since the loop is simple.

## Dependency interface surprises

- N/A. This routine has no dependencies beyond the reinterpret utility.

## Automation opportunities

- The d-to-z translation for this routine is entirely mechanical: add `reinterpret()`, double strides/offsets, and duplicate each scalar operation for real and imaginary parts. A `d2z` codegen tool could handle routines where only addition/subtraction is used (no complex multiplication or division).

## Coverage gaps

- N/A. 100% line, branch, and function coverage achieved. The routine has no conditional branches beyond the loop bound check.

## Complex number handling

- All complex operations are addition and subtraction only, which are safe to inline as independent real/imaginary component operations. No complex multiplication, division, or absolute value needed.
- Used the standard `reinterpret(x, 0)` pattern for Float64Array views with `strideX * 2` / `offsetX * 2` conversion from complex-element strides to Float64 strides.
