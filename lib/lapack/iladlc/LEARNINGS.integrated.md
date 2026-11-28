# iladlc: Translation Learnings

## Translation pitfalls

- [x] Fortran returns 1-based column index; JS returns 0-based. N=0 case: Fortran returns N (=0), JS returns -1.
- [x] The corner test uses A(1,N) and A(M,N) -- must correctly index the (0,N-1) and (M-1,N-1) elements in 0-based.

## Dependency interface surprises

- [x] N/A. Self-contained, no dependencies.

## Automation opportunities

- [x] The real version is identical to ilazlc minus the imaginary part checks. Could be generated from a template.

## Coverage gaps

- [x] All paths covered: N=0, quick-return (corner non-zero), full scan finding non-zero, all zeros returning -1.

## Complex number handling

- [x] N/A. Real-valued only. No interleaved re/im pairs -- each element is a single double.
