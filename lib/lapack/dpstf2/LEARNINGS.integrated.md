# dpstf2: Translation Learnings

## Translation pitfalls

- Fortran PIV is 1-based; JS PIV is 0-based. All PIV assignments and comparisons had to be shifted.
- The `RANK` output is a scalar integer in Fortran (passed by reference). In JS, we use a 1-element `Int32Array` so the caller can read the result after the call. This is the first routine in the project with this pattern.
- The MAXLOC intrinsic (used for pivot selection) returns a 1-based index in Fortran. Translated to a manual loop that returns 0-based relative index, then added `j` to get the absolute 0-based index.
- The "in-between" swap (elements between j and pvt) uses different stride patterns for upper vs lower: in upper, it swaps row j entries (stride=sa2) with column pvt entries (stride=sa1), and vice versa for lower.

## Dependency interface surprises

- `dgemv` takes separate strideA1, strideA2, offsetA parameters (not LDA), which simplifies sub-matrix operations.
- `DISNAN` / `LSAME` are not needed in JS: NaN check is `x !== x`, and string comparison replaces LSAME.

## Automation opportunities

- The gen_test.py scaffold could detect Int32Array output parameters (like PIV, RANK) and auto-generate the 1-based to 0-based PIV conversion in test assertions.

## Coverage gaps

- The NaN diagonal path (`ajj !== ajj`) at the initial check and during iteration is not covered by tests. Constructing a matrix with NaN on the diagonal is straightforward but not included since the main algorithmic paths are well-tested.

## Complex number handling

- N/A: dpstf2 is a real-valued routine.
