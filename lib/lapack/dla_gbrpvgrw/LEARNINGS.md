# dla_gbrpvgrw: Translation Learnings

## Translation pitfalls

- Fortran KD = KU + 1 (1-based row of diagonal). In 0-based JS, kd = ku (since arrays are 0-based, the diagonal row index is ku, not ku+1).
- Band storage indexing: Fortran `AB(KD+I-J, J)` with 1-based I,J becomes `AB[offset + (kd+i-j)*stride1 + j*stride2]` with 0-based i,j. The expression `kd+i-j` is identical in both cases because the 1-based-to-0-based shifts cancel in the subtraction.
- Fortran test arrays must match declared leading dimensions. Declaring `AB(10, 10)` but passing `LDAB=1` causes the function to read wrong memory locations. Always declare arrays with exact matching dimensions (e.g., `AB(1, 3)` for LDAB=1, N=3).

## Dependency interface surprises

- N/A: dla_gbrpvgrw has no dependencies (leaf node).

## Automation opportunities

- N/A: this was a straightforward translation with no repeated mechanical steps.

## Coverage gaps

- 100% line and branch coverage achieved. All code paths are covered including the UMAX=0 skip branch and various band widths.

## Complex number handling

- N/A: dla_gbrpvgrw is a real-valued routine.
