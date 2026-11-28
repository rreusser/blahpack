# dgttrs: Translation Learnings

## Translation pitfalls

- dgttrs in Fortran calls ILAENV for block size and loops over RHS in blocks via dgtts2. In JS, we skip ILAENV entirely and pass all NRHS columns to dgtts2 at once. No performance concern since dgtts2 loops over columns internally.
- IPIV is 0-based in JS. The Fortran `IPIV(I)==I` check (1-based) becomes `IPIV[ip] === i` (0-based). The pivot swap target `IPIV(I)=I+1` in Fortran becomes `IPIV[ip] = i+1` in JS (0-based: i+1 means next row).

## Dependency interface surprises

- dgtts2 takes `itrans` as an integer (0, 1, or 2), not a character. dgttrs does the character-to-integer decode.

## Automation opportunities

- N/A. The translation was straightforward with no repeated mechanical steps.

## Coverage gaps

- 100% line and branch coverage on both dgttrs and dgtts2 base.js.
- The Fortran NRHS<=1 vs NRHS>1 code path split is not replicated in JS; we use a single unified loop. Both single-RHS and multi-RHS are tested.

## Complex number handling

- N/A. Real-valued routine only.
