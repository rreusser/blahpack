# zhetri: Translation Learnings

## Translation pitfalls

- IPIV is 0-based in JS, with bitwise NOT (`~p`) encoding negative (2x2 pivot) indices. The Fortran reference uses 1-based negative values. Conversion: positive `ipiv[k]` maps to `ipiv[k] - 1`; negative maps to `~(-ipiv[k] - 1)`.
- All internal loop indices (k, kp, j) remain 1-based to match the Fortran logic, converted at array access via `(k-1)*stride`.
- The diagonal of a Hermitian matrix is real; imaginary parts are explicitly zeroed when writing diagonal entries (`Av[p+1] = 0.0`).

## Dependency interface surprises

- `zhemv` takes both strideA1 and strideA2 for the matrix plus separate stride/offset for vectors.
- `zdotc` returns a Complex128 object; only `real(dotc)` is used for diagonal updates (since the result is real for Hermitian inputs), but the full complex value is needed for off-diagonal (A(k,k+1)) updates.

## Automation opportunities

- Test scaffolding from fixtures could be fully automated: the pattern of loading `_factored` + expected, converting IPIV, calling `zhetri`, comparing output is mechanical.

## Coverage gaps

- All fixture cases (n=0, n=1, 3x3, 4x4 with 1x1 and 2x2 pivots, singular, swap) are tested.
- Row-major (negative strides) not tested but supported by the ndarray interface.

## Complex number handling

- Complex arithmetic is inlined for the 2x2 block inversion (akkp1R, akkp1I divided by scalar d).
- `cmplx.absAt` used for complex modulus of off-diagonal element.
- `zdotc` (conjugated dot product) from BLAS returns Complex128; real/imag extracted via stdlib accessors.
- Conjugation during row/column swaps is done inline by negating imaginary parts.
