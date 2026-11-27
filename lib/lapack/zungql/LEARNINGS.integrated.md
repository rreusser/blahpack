# zungql: Translation Learnings

## Translation pitfalls

- Direct analog of dorgql. Structurally identical: determine blocking, call zung2l for unblocked part, then loop over blocks calling zlarft + zlarfb + zung2l.
- Internal workspace allocated as `new Complex128Array(ldwork * nb)` since the WORK parameter is ignored (allocated internally).

## Dependency interface surprises

- zlarft and zlarfb take complex-element strides/offsets. The internal workspace uses stride=1 and ldwork=N, matching the Fortran LDWORK convention.
- zlarft('B', 'C', ...) for backward/columnwise direction, matching the QL factorization structure.

## Automation opportunities

- The dorgql -> zungql translation is mechanical: replace dorg2l -> zung2l, dlarft -> zlarft, dlarfb -> zlarfb, Float64Array -> Complex128Array, add reinterpret for zeroing elements.

## Coverage gaps

- Blocked path (NB < K) not exercised with small test matrices (K <= 3 < NB=32). This is acceptable; the blocked path's correctness depends on zlarft + zlarfb which are tested independently.
- The blocked path logic is identical to dorgql's which is tested with larger matrices.

## Complex number handling

- Zeroing matrix elements requires setting both real and imaginary parts to 0.0 via the Float64Array view.
- No complex arithmetic in zungql itself; all complex ops happen in zung2l, zlarft, and zlarfb.
