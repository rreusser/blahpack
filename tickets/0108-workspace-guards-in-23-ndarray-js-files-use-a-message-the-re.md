---
id: 0108
title: Workspace guards in 23 ndarray.js files use a message the replay cannot parse, so min-work and short-work skip them
status: resolved
area: workspace
opened: 2026-11-26
resolved: 2026-11-27
---

## Problem

The wrapper replay's `min-work` and `short-work` variants (`test/harness/replay.js`) learn the minimum `ndarray.js` demands from the RangeError it throws for an empty workspace, by matching `/\b(\w+) array must have at least (\d+) elements/`. A guard whose message has another shape (`` `WORK` must have at least %d elements (stride %d, ...) ``, `` `work` must have at least `M` = %d ``, a literal `1 element`) gives no minimum, so both variants skip that workspace: a minimum below what base.js touches (`min-work`, ticket 0096) and a wrapper that bypasses the check (`short-work`, ticket 0077) go unseen there. Nothing requires the canonical message: `lint:workspace-length-guard` (ticket 0107) checks only that a guard throwing `RangeError` exists.

## Evidence

- 23 modules, found while working on ticket 0107: dgeevx dgeqlf dgsvj0 dgsvj1 dlarrd dlarrf dlatrs3 dsysv dsytrd dsytrf dsytrf_rk dsytrf_rook zgsvj0 zgsvj1 zhetrd zhetrf zhetrf_rk zhetrf_rook zlatrz zsysv zsytrf zsytrf_rk zsytrf_rook.
- zggevx had the same for all four workspaces; fixed under ticket 0107 (its `min-work`/`short-work` now run, with no mismatch).

## Reproduce

```bash
for f in lib/*/base/*/lib/ndarray.js; do grep -oE "RangeError\( *(format\( *)?'invalid argument\. [^']*'" $f | grep -i work | grep -v "argument\. \`stride" | grep -vqE "[A-Za-z]+ array must have at least %d elements" && echo $f; done
```

## Direction

- Make `lint:workspace-length-guard` also require the canonical message, `invalid argument. <NAME> array must have at least %d elements from offset %d. Provided length: %d.`, with the minimum as a `%d` argument (not a literal), and rewrite the 23 guards (a codemod: the minimum expression and the offset are already in each guard).

## Resolution

`lint:workspace-length-guard` now requires every guard on a spec workspace, whether or not its minimum is known, to throw `format( 'invalid argument. <NAME> array must have at least %d elements from offset %d. Provided length: %d.', min, offset, length )`, with the minimum as an argument. The 27 guards in 24 modules that differed (the 23 listed, plus dporfs, whose stride-in-message form parsed but was not canonical) were rewritten. The guards' conditions are unchanged.

With the minimums now readable, the replay's `min-work` variant found a real defect on its first run: zlahef's upper row-max search skipped row K, so zhetrf's upper blocked path picked pivots the reference does not. It is fixed, with Fortran fixtures. See the LEARNINGS entry of 2026-11-27 and the evidence on ticket 0093.
