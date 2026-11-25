---
id: 0087
title: Layout wrappers enforce leading-dimension bounds that disagree with the reference
status: resolved
area: wrappers
opened: 2026-11-25
resolved: 2026-11-25
---

## Problem

The layout wrapper `lib/<pkg>/base/<r>/lib/<r>.js` of about 147 routines throws
on leading-dimension bounds (`LDx < max( 1, … )`) that are not spec checks:
the reference Fortran never checks them. Most restate the documented
constraint. DLACPY, for example, documents `LDA >= max(1,M)` but does not check
it. In 42, the bound disagrees with the row count the spec derives for the
array (`spec/<r>.json`, `params[].rows`). About 33 of those are genuine; the
rest differ only in case (`m` vs `M`).

- **Too strict:** the wrapper rejects calls LAPACK accepts, and the `.ndarray`
  form handles the same data fine.
- **Too lax:** the wrapper accepts a leading dimension smaller than the array
  needs. `dlasyf_rk` checks `LDW >= max(1, nb)`, but W is N-by-nb, so it needs
  `max(1, N)`.

Nothing compares these bounds with the spec. `spec-prologue` derives only the
spec's own checks. They look like scaffold defaults (`max( 1, M )` or
`max( 1, N )`).

## Evidence

- `dlangb`, `zlangb`: LDAB >= max(1, N), but band storage needs `kl + ku + 1`.
  Same for `dlansb`, `dlantb`, `zlanhb`, `zlansb`, `zlantb` (`K + 1`).
- `dlarzb`, `zlarzb`: LDV/LDT/LDWORK >= max(1, M). The reference needs
  LDV >= K (rowwise V is K by L), LDT >= K, and LDWORK >= N (left) or M (right).
- `dlarfb_gett`: in column-major, LDT/LDA/LDWORK >= max(1, M). The reference
  needs LDT >= K, LDA >= max(1, K), LDB >= max(1, M) and LDWORK >= max(1, K).
  In row-major, LDT >= N, but T is K by K. Same pattern in `zlarfb_gett`,
  `dtprfb` and `ztprfb`.
- `dlabrd`, `zlabrd` (LDY), `dlaqps`, `zlaqps` (LDF), `dlaqr0`, `dlaqr4`,
  `zlaqr0`, `zlaqr4` (LDZ; rows `ihiz`), `dlarzt` (LDV), `zlacrm` (LDC).
- Found while repairing `@example` blocks (ticket 0086): the zlarzb and
  dlarfb_gett examples could not satisfy their LD checks.

## Reproduce

```bash
node --input-type=module -e "import f from './lib/lapack/base/dlangb/lib/index.js'; const AB = new Float64Array( 15 ).fill( 1 ); console.log( f.ndarray( 'max', 5, 1, 1, AB, 1, 3, 0, new Float64Array( 5 ), 1, 0 ) ); f( 'column-major', 'max', 5, 1, 1, AB, 3, new Float64Array( 5 ) );"
```

The `.ndarray` call prints `1`. The layout call throws "Seventh argument must
be greater than or equal to max(1,N)" for LDAB = kl+ku+1 = 3.

## Direction

Every layout-wrapper LD bound should be either a spec check or equal to
`max( 1, <spec rows> )` for that array, with columns for row-major. A lint rule
that compares each bound against `spec.params[].rows` makes the class
impossible. Fix the code after the rule exists (structural first).

## Resolution

Mechanism: lint rule `spec-ld-bounds` (lint/rules/spec-ld-bounds/, enabled in eslint.config.cjs, CONVENTIONS V11). Every LD bound a layout wrapper throws on must be a generated spec check, a hand translation of a reference check the spec could not translate, or `LDX < max( 1, R )` with R the array's spec rows (column-major) or cols (row-major). One unguarded bound is allowed only when rows equal cols. The rule found 145 violations in 75 wrappers; the corpus is now clean. Rebound to the spec extent (each confirmed against the Fortran LD doc): d/zlangb, dlansb, dlantb, zlanhb, zlansb, zlantb, dlaqsb, zlaqsb, zlaqhb (LDAB); dlaqps (LDF); d/zlarfb_gett (LDT, LDA, LDWORK); d/ztprfb (LDT); zlarzb (LDT); zlarzt (LDT); zla_gbrfsx_extended (row-major LDB, LDY). Split by layout, because one bound for both layouts was too strict in row-major or too lax: dlasyf, zlasyf, zlahef, dlatrd, zlatrd, d/zlasyf_aa, d/zla_gbrpvgrw, zlarcm, dla_gbrfsx_extended, zla_gerfsx_extended, zla_porfsx_extended. Dropped where the spec cannot state the bound (no extent, a LAPACK doc typo or bug, or an extent that depends on STOREV, SIDE, WANTZ or WANTQ). The reference does not check these LDs either; the spec gaps are ticket 0088. Tests: each changed wrapper has a test that accepts the minimal LD and rejects one less, and each fails on the old code; tests that asserted the dropped checks were removed. The dlasyf_rk evidence was a misreading: its row-major LDW >= nb is correct. The m/M cases were not spec defects, since names compare case-insensitively (S7).
