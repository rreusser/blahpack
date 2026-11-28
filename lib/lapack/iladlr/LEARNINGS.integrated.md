# iladlr: Translation Learnings

## Translation pitfalls

- [x] Fortran returns 1-based row index; JS returns 0-based. M=0 case: Fortran returns M (=0), JS returns -1.
- [x] The Fortran uses MAX(I,1) to avoid out-of-bounds access in the while loop when I decrements past 1. In JS, we just check i >= 0.

## Dependency interface surprises

- [x] N/A. Self-contained.

## Automation opportunities

- [x] Structurally identical to ilazlr minus imaginary part. Could be templated with iladlc.

## Coverage gaps

- [x] All paths covered: M=0, quick-return (corner non-zero), full scan, all zeros.

## Complex number handling

- [x] N/A. Real-valued only.
