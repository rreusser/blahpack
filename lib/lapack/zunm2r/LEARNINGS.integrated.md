# zunm2r: Translation Learnings

## Routine Summary

- **Source**: `data/lapack-3.12.0/SRC/zunm2r.f` (283 lines, 101 code body)
- **Complexity**: 0 GOTOs, straightforward loop over reflectors
- **Dependencies**: zlarf
- **Coverage**: 100% line, 100% branch

## Translation pitfalls

- The tau conjugation logic must match the Fortran iteration direction. When `trans='C'`, the Fortran code conjugates tau before passing to ZLARF, not after. Our implementation does the same: `taui[1] = -TAU[...]`.
- The existing local helper in `lib/lapack/base/zggev/lib/zunm2r.js` uses strides in **doubles**, while the standalone module uses strides in **complex elements** (matching the stdlib-js convention from `signature.py`). The key difference is in the zlarf call: the local helper divides strides by 2 before passing to zlarf, while our version passes them directly since both use complex-element strides.

## Dependency interface surprises

- zlarf expects vector stride (strideV) in complex elements, and offsets in Float64 indices. The matrix strides (strideC1, strideC2) are also in complex elements. This is consistent with our zunm2r stride convention.
- The zlarf signature uses a separate tau array with an offset, not a 2-element scalar. Our taui temporary array serves as a bridge, extracting the correct tau[i] element (with optional conjugation).

## Automation opportunities

- N/A. zunm2r is a thin wrapper around zlarf. The translation is mechanical and closely mirrors the Fortran structure.

## Coverage gaps

- None. All branches are covered: left/right side, transpose/no-transpose, quick returns for M=0/N=0/K=0, and rectangular C matrices.

## Complex number handling

- No complex arithmetic is performed directly in zunm2r. The only complex operations are reading tau values (with optional conjugation) and saving/restoring A(i,i). All actual computation is delegated to zlarf.
- Conjugation of tau is a simple sign flip on the imaginary part: `taui[1] = -TAU[offset + 1]`.
