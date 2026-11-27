# dormtr: Translation Learnings

## Translation pitfalls

- Direct mirror of zunmtr (complex version) — the only difference is `transpose` vs `conjugate-transpose` for the trans parameter.
- dormql and dormqr both use long-form strings ('left', 'right', 'no-transpose', 'transpose'), so dormtr passes them through directly.

## Dependency interface surprises

- dormql and dormqr do NOT take a `lwork` parameter — they handle workspace internally. The `lwork` param in dormtr's signature is essentially unused (only relevant in Fortran for workspace queries).
- dsytrd also allocates workspace internally in JS — no WORK/LWORK params needed.

## Automation opportunities

- N/A — dormtr is a thin wrapper, no mechanical transforms needed.

## Coverage gaps

- All 8 combinations of side x trans x uplo are tested with 4x4 identity C.
- Rectangular C tested for left/upper (4x2) and right/lower (2x4).
- Quick returns: M=0, N=0, NQ=1 all tested.
- 100% line and branch coverage achieved.

## Complex number handling

- N/A: dormtr is a real-valued routine.
