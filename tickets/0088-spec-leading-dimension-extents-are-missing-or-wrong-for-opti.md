---
id: 0088
title: Spec leading-dimension extents are missing or wrong for option-dependent and doc-typo arrays
status: open
area: spec
opened: 2026-11-25
---

## Problem

`spec/<r>.json` gives each 2-D array one `rows` and one `cols` extent, taken
from the LD check or the LD's doc line. `spec-ld-bounds` (ticket 0087) uses
those extents to check every non-reference LD bound in a layout wrapper. Where
an extent is missing or wrong, the rule can't derive a bound. Those wrappers now
skip the check, as the reference does: the reference checks none of these LDs.
So a too-small LD there is not caught, and the wrong extent also shapes the
generated docs and any future derived check.

## Evidence

1. **The extent depends on an option the spec doesn't model.** The spec records
   only one case:
   - `dtprfb`/`ztprfb` V (STOREV, SIDE: M, N or K), A (SIDE: K or M), and WORK.
   - `dlarfb`/`zlarfb` V and WORK, and `dlarft`/`zlarft` V (STOREV).
   - `dlarzb`/`zlarzb` V, and `dlarzt`/`zlarzt` V. The spec takes the
     STOREV='C' rows (L or N), but the reference supports only STOREV='R'
     (LDV >= K).
   - `dlarzb`/`zlarzb` WORK (SIDE).
   - `d/zlaqr0`, `d/zlaqr4` Z (WANTZ).
   - `dlaexc` Q (WANTQ).
   - `dtgex2`/`ztgex2` Q and Z (WANTQ/WANTZ).

   Every one of these matched or nearly matched the spec, so the rule can't
   flag them.
2. **No rows, because the LD doc line is a typo or unparseable.**
   - `dlaqgb`/`zlaqgb` AB (`LDA >= KL+KU+1`).
   - `dlarfx` C (`LDC >= (1,M)`).
   - `dlatdf`/`zlatdf` Z (`LDA >= max(1, N)`).
   - `dlatrd` A (`LDA >= (1,N)`).
   - `d/zlaqr1`, `d/zlaqr2`, `d/zlaqr3` H, Z, V, T and WV (`N <= LDH`,
     `NW <= LDV`).
   - `dla_gbrfsx_extended` AB (`LDBA >= max(1,N)`).
   - `dlat2s`/`zlat2c` SA (the doc says M for an N by N SA).
   - `dlaqz1`, `dlaqz2` and `dlaqz4` (no bound documented).
   - `zlaswp` A.
   - `dsband` (ARPACK) Z, AB and V.
3. **No cols** (row-major):
   - `dsyswapr`/`zsyswapr` A.
   - `dtgex2`/`ztgex2` A and B.
   - T of `dlamswlq`, `dlamtsqr`, `zlamtsqr`, `dlaswlq`, `dlatsqr`, `zlatsqr`,
     `dorgtsqr`, `dorgtsqr_row`, `zungtsqr` and `zungtsqr_row`.
4. **Rows that copy a LAPACK doc bug.**
   - `zlacrm` C: the doc says `LDC >= max(1,N)`, but C is M by N.
   - `dla_gbrfsx_extended` AFB: the doc says `LDAFB >= max(1,N)`, but band LU
     storage needs 2*KL+KU+1.
5. **Wrong role.** `dlarzb` LDWORK has role `lwork`, but it is the LD of a
   2-D WORK (`WORK.ld`).

## Reproduce

```bash
node -e "const fs=require('fs');for(const f of fs.readdirSync('spec').filter(f=>f.endsWith('.json'))){const s=JSON.parse(fs.readFileSync('spec/'+f));for(const p of s.params||[])if(p.ld&&(!p.rows||!p.rows.js||!p.cols||!p.cols.js))console.log(s.routine,p.name,'rows:',p.rows&&p.rows.js,'cols:',p.cols&&p.cols.js)}" | head -40
```

The option-dependent cases (item 1) don't show up there. Compare the LD doc
lines (`data/lapack-3.12.0/SRC/<r>.f`) that start with "If STOREV/SIDE/WANTZ".
