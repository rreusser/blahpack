# zheswapr: Translation Learnings

## Translation pitfalls

The "middle" loop (across the diagonal) looks symmetric to `dsyswapr`/`zsyswapr`
but in the Hermitian case each swap is accompanied by a conjugation on both
sides — effectively a swap-with-transpose rather than a plain swap. The
reference Fortran applies `DCONJG` to both endpoints inside the loop and then
applies a lone `DCONJG` to the single corner element `A(i1,i2)` (upper) or
`A(i2,i1)` (lower) after the loop. This corner element is the one point that
is both "above the diagonal" and "on the row being reflected"; the middle loop
(I=1..I2-I1-1) skips it, so it needs a separate explicit conjugation to land
in the right form.

Diagonal elements of a Hermitian matrix are real. The Fortran code does not
force the imaginary part to zero — it just swaps the two diagonal entries as
complex values — relying on the caller to supply a proper Hermitian matrix
with real diagonal. Our JS mirrors that: we copy the whole `(re, im)` pair.

## Dependency interface surprises

`zswap` uses complex-element strides/offsets (stride times 2 happens inside
the routine), so we pass `strideA1`, `strideA2`, and `offsetA` directly without
doubling. For the element-level conjugation loop we maintain a separate
reinterpreted `Float64Array` view along with pre-doubled strides (`sa1`, `sa2`,
`oa`) so that `view[idx]`/`view[idx+1]` give real/imag of a single complex
element.

## Complex number handling

Conjugation is inlined as a sign flip on the imaginary component
(`view[idx+1] = -view[idx+1]`), which is safe per the project conventions.
No complex division or absolute value is involved.
