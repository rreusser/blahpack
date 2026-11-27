# dtgsy2: Translation Learnings

## Translation pitfalls

- The Z matrix is LDZ x LDZ (8x8) stored column-major as a flat Float64Array. Indexing: Z[col*LDZ + row].
- Block structure detection uses GOTO-based loops in Fortran; translated to while loops.
- IWORK stores row block starts at indices 0..p-1, then column block starts at indices p+1..q, with sentinel values at p and q+1.
- The NOTRAN and TRANS branches have completely different Z matrix layouts (transposed coupling).
- Four sub-cases per branch: (mb=1,nb=1), (mb=1,nb=2), (mb=2,nb=1), (mb=2,nb=2).
- The dger calls for update steps use RHS as both x and y vectors at different offsets.
- Fortran `CALL DAXPY(N-JE, RHS(2), B(JS,JE+1), LDB, ...)` -- the RHS(2) is a scalar (Fortran array element as scalar arg), while in JS we pass it directly as `RHS[1]`.

## Dependency interface surprises

- dgetc2 returns 0-based IPIV/JPIV, which dgesc2 expects.
- dgesc2 scale parameter is Float64Array `scale[0]`.
- dgemm/dgemv use long-form strings ('no-transpose', 'transpose').
- dcopy takes `(N, x, strideX, offsetX, y, strideY, offsetY)`.

## Automation opportunities

- The NOTRAN/TRANS branches are near-mirror images. A code generator could produce both from a template.

## Coverage gaps

- IJOB > 0 paths (DLATDF calls) are not implemented -- dlatdf is not translated yet. These paths throw an error.
- The transposed 2x2 block cases (mb=2,nb=2 in TRANS branch) need a test with a 4x4 system where both A and B have 2x2 blocks, under TRANS='T'.
- Scaling paths (SCALOC != 1) would require near-singular small systems.

## Complex number handling

- N/A: dtgsy2 is a real-valued routine.
