# zunmr2: Translation Learnings

## Translation pitfalls

- Reflectors are stored in ROWS of A (not columns like zunm2r). The reflector vector for reflector i starts at A(i, 0) with stride = strideA2 (column stride).
- The diagonal element to save/restore is at A(i, NQ-K+i), NOT A(i,i). This is the key difference from QR-based routines.
- zlacgv conjugates NQ-K+i elements (0-based count), NOT NQ-K+i-1. The Fortran NQ-K+I-1 is 1-based, translating to NQ-K+i in 0-based.
- When NOTRAN, tau is conjugated (DCONJG). When TRANS='C', tau is used as-is. This is opposite from zunm2r's convention.

## Dependency interface surprises

- zlarf signature: `(side, M, N, v, strideV, offsetV, tau, offsetTau, C, strideC1, strideC2, offsetC, WORK, strideWORK, offsetWORK)`. The reflector vector takes a single stride (not stride1/stride2).
- zlacgv takes stride in complex elements and offset in complex elements.

## Automation opportunities

- The zunmr2/zunmrq pair mirrors dormr2/dormrq. A transform could auto-generate the complex version from the real version by adding reinterpret() and complex tau handling.

## Coverage gaps

- All four SIDE x TRANS combinations tested (left/right x N/C).
- K=0 and K=1 edge cases tested.

## Complex number handling

- Used reinterpret() to get Float64Array views for direct element access on A and TAU.
- Complex conjugation of tau is done manually via negating the imaginary part.
- zlacgv handles row conjugation before/after zlarf application (required for rowwise reflectors).
