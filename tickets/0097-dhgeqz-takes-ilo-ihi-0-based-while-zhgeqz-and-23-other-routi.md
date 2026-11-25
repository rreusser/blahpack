---
id: 0097
title: dhgeqz takes ILO/IHI 0-based while zhgeqz and 23 other routines take them 1-based
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

## Reproduce

```bash
node -e 'for(const r of ["dhgeqz","zhgeqz","dgghrd"]){const s=require("./spec/"+r+".json");console.log(r,s.params.filter(p=>/^I(LO|HI)$/.test(p.fortran)).map(p=>p.fortran+":"+(p.base??1)).join(" "))}'
```
