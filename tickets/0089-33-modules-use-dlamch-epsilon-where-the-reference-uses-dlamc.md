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
