# dlarfx: Translation Learnings

## Translation pitfalls

- The Fortran uses computed GOTO with M or N as the index to select unrolled code for sizes 1-10. Instead of 20 separate unrolled cases, used a generic loop-based implementation for M/N <= 10 and fall back to dlarf for larger sizes.
- Performance: the loop-based approach is simpler but may be slightly slower than fully unrolled code. For the sizes used by dlaexc (3-4), this is negligible.

## Dependency interface surprises

- dlarf and dlarfx share the same interface pattern for side/M/N/v/tau/C/WORK.

## Automation opportunities

- N/A

## Coverage gaps

- Only M=2-3, N=2-3 tested via dlaexc calls. Larger sizes (up to 10) untested but share the same code path.

## Complex number handling

- N/A: real routine only.
