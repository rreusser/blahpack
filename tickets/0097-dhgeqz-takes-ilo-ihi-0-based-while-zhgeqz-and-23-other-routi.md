---
id: 0097
title: Scalar index bases are unchecked; dhgeqz and dlaqr5 differ from their twins, and dlaqr5 from its own spec
status: open
area: wrappers
opened: 2026-11-25
---

## Problem

`ILO`/`IHI` mean the same thing in every routine that takes them. dhgeqz alone takes them 0-based: `spec/overrides/dhgeqz.json` sets `base: 0`, and its callers dgges, dggev and dggevx pass `ilo - 1`, `ihi - 1`. Its twin zhgeqz takes them 1-based, as do the other 23 routines. A caller who ports a call from zhgeqz to dhgeqz, or from dgghrd to dhgeqz, is off by one, and nothing flags it. Both are typed `integer`.

How it was permitted: the override records the difference, but it doesn't justify it ("unlike the 1-based ILO/IHI of the other routines"). No check compares a scalar index's base across twins or across routines that share a parameter.

## Evidence

- In `spec/*.json`, input `ILO` is `base: 0` in dhgeqz only, and 1-based in 24 routines: dgebak, dgehd2, dgehrd, dggbak, dgghrd, dhseqr, dlahqr, dlaqr0, dlaqr4, dlaqz4, dorghr, dormhr, and their z twins, zhgeqz included.
- `lib/lapack/base/dhgeqz/lib/dhgeqz.js:30` documents 0-based ILO/IHI; `lib/lapack/base/zhgeqz/lib/zhgeqz.js:33` documents 1-based ones.
- Found by the ticket 0094 caller-fix agent, whose examples now follow each routine's own JSDoc.
- dhgeqz/zhgeqz is the only d/z twin pair whose shared params differ in `base`.

## Evidence 2026-11-25 (2): dlaqr5

The ticket 0094 part-07 agent found that dlaqr5's `ktop`, `kbot`, `iloz` and `ihiz` are 0-based in practice:
- the wrapper passes them straight to `base.js`, which indexes 0-based;
- the ndarray JSDoc and the wrapper's own tests use `0..N-1`;
- but `lib/lapack/base/dlaqr5/lib/dlaqr5.js:32-33,41-42` documents them as 1-based.

`spec/dlaqr5.json` records all four as 1-based, with no `base: 0` override. So the spec disagrees with the code. zlaqr5 is 1-based in its spec, its JSDoc and its code.

This widens the problem. A scalar index's base is declared only by a spec override, and nothing compares that declaration with what `base.js` actually does. A test that called each such routine at the boundary index (e.g. `ihiz = N` for a 1-based routine) would expose any mismatch.

## Reproduce

```bash
node -e 'for(const r of ["dhgeqz","zhgeqz","dgghrd"]){const s=require("./spec/"+r+".json");console.log(r,s.params.filter(p=>/^I(LO|HI)$/.test(p.fortran)).map(p=>p.fortran+":"+(p.base??1)).join(" "))}'
```
