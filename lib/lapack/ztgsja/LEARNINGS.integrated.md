# ztgsja: Translation Learnings

## Translation pitfalls

- Complex strides and offsets must be doubled when working through Float64
  views (reinterpret). The base.js code converts all complex strides/offsets
  to Float64 indices via `sa1 = strideA1 * 2` etc.
- Diagonal elements are forced real after each rotation step by zeroing the
  imaginary part explicitly (`Av[ ia + 1 ] = ZERO`).
- The `zlags2` output contains separate real/imaginary parts for the complex
  sines (snuR, snuI, etc.), which must be packed into Float64Array[2] pairs
  for `zrot`.

## Dependency interface surprises

- `zlags2` returns a plain object with named fields (csu, csv, csq, snuR,
  snuI, snvR, snvI, snqR, snqI) rather than writing to output arrays.
- `zrot` expects the complex sine as a Float64Array of length 2 rather than
  a Complex128 value.

## Automation opportunities

- The rotation packing pattern (zlags2 output -> Float64Array[2] for zrot)
  could be wrapped in a helper if more routines use the same pattern.

## Coverage gaps

- The non-convergence path (info=1, kcycle > MAXIT) is not tested because
  crafting a non-converging input is impractical.

## Complex number handling

- All complex arithmetic goes through library calls (zcopy, zdscal, zrot,
  zlags2, zlapll, zlaset). No inline complex division or multiplication.
- Conjugates of complex sines are computed inline by negating the imaginary
  part (`conjSnuArr[1] = -rot.snuI`).
