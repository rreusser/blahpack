---
id: 0089
title: 33 modules use dlamch('epsilon') where the reference uses DLAMCH('Precision') (or the reverse)
status: open
area: base
opened: 2026-11-25
---

## Problem

LAPACK has two machine-epsilon constants: `DLAMCH('E')` = 2^-53 ≈ 1.11e-16 (the rounding unit) and `DLAMCH('P')` = 2^-52 ≈ 2.22e-16 (eps·base). The JS `dlamch` follows the reference exactly (`'epsilon'` is 'E', `'precision'` is 'P'). But 32 modules call `dlamch( 'epsilon' )` where their reference source uses only `DLAMCH( 'Precision' )`, and dtgevc does the reverse. Every threshold built from it is then off by 2x, or √2 under a square root:
- SMLNUM = SAFMIN/EPS and BIGNUM;
- RMIN = sqrt(SMLNUM) and RMAX, which decide when the eigen drivers rescale;
- convergence tolerances.

Results usually still satisfy their residual checks, so tests cannot see the difference. But borderline inputs take a different path than the reference (CONVENTIONS T1).

## Evidence

- **JS uses `'epsilon'`, reference uses `'Precision'`:** dlaqgb dlaqge dlaqr5 dlaqsb dlaqsp dlaqsy dsbev dsbevx dspev dspevx dstev dstevr dsyev dsyevr dsyevx zhbev zhbevx zheev zheevr zheevx zhpev zhpevx zlaqgb zlaqge zlaqhb zlaqhe zlaqhp zlaqsb zlaqsp zlaqsy zlatbs zlatrs.
- **JS uses `'precision'`, reference uses `'Epsilon'`:** dtgevc.
- **Example:** `lib/lapack/base/dsyev/lib/base.js:78` has `dlamch( 'epsilon' )`; `dsyev.f:223` has `EPS = DLAMCH( 'Precision' )`.
- **Already fixed (strict-mode PR):** dlatrs, dlatbs and dlatps, which hard-coded `SAFMIN / 1.11e-16`. For dlatrs with N = 1, A = [1], b = [1e300], scale was 4.99e-9 where the reference gives BIGNUM/xmax = 9.98e-9.
- The list was found by comparing each module's `dlamch` arguments with the `DLAMCH` arguments in its `.f` source (see Reproduce). Modules that import stdlib constants instead of calling dlamch are not covered by this comparison and need the same check.

## Reproduce

```bash
for d in lib/*/base/*; do r=$(basename $d); F=data/lapack-3.12.0/SRC/$r.f; [ -f $F ] || continue; js=$(cat $d/lib/*.js | grep -c "dlamch( 'epsilon' )"); fE=$(grep -ciE "[DZ]LAMCH\( *'(E|Eps)" $F); fP=$(grep -ciE "[DZ]LAMCH\( *'(P|Prec)" $F); [ "$js" -gt 0 ] && [ "$fE" -eq 0 ] && [ "$fP" -gt 0 ] && echo $r; done
```

## Direction

- **Make it a check, not a one-off fix:** a lint or conformance rule that compares the set of machine constants each base.js uses (`dlamch( … )` calls and the stdlib constants it imports) with the `DLAMCH` arguments of its reference source.
- **Then fix the listed modules mechanically.** Add a test per routine family on an input at the scaling boundary, where the two choices differ (for the eigen drivers, a norm between RMIN computed with 'E' and with 'P').

## Progress 2026-11-25

**Enforcement:**
- `dlamch`'s `cmach` is typed `MachineParameter`, a union of the canonical values. It comes from a new `type` field on the `spec/options.json` family, which the JSDoc generator (`lint/lib/jsdoc-spec.cjs`) uses for the option. `tsc` now rejects any other key; `lint/typecheck-config.test.cjs` pins the alias to the family's values.
- `bin/spec-gen/extract.cjs` records each routine's `DLAMCH` letters in `data/fortran-checks.json` (`dlamch`, 381 routines).
- The new conformance check `conf:machine-constants` (CONVENTIONS X4) fails a module whose epsilon (dlamch call, literal, stdlib `float64/eps`, `Number.EPSILON`) is a class its reference never queries, and any use of `Number.MIN_VALUE`. It does not check the reverse direction: dlaqr3, for example, legitimately takes its constants from dlaqr2's shared implementation.

**Fixed:**
- **Unknown keys that returned 0:** dtgsna, dtgsen, ztgsen, dlarrf (`'safe minimum'`), dggsvd3, zggsvd3 (`'Safe Minimum'`), zla_herfsx_extended (`'eps'`). The other 25 non-canonical spellings, which happened to be valid keys, are normalized too.
- **'E' → 'P':** the 32 modules listed above, and dlarrr (a literal).
- **'P' → 'E':** dtgevc, dla_gbrfsx_extended and dlasd2 (stdlib eps), dlartgp and dlartgs (literals).
- **zlargv:** `SAFMN2` is now the reference formula (2^-484). It was 2^-511.
- **dlanv2:** `Math.floor` → `Math.trunc` for Fortran `INT` (no value change).
- **Tests whose oracle copied the bug:** dsbevx, zhbevx, zheevx and zhpevx.

**Left:** a regression test per routine family at the boundary where the two constants differ.
