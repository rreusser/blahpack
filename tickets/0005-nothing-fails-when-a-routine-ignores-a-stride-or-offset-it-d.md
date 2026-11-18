---
id: 0005
title: Nothing fails when a routine ignores a stride or offset it declares
status: open
area: conformance
opened: 2026-11-18
---

## Problem

An ignored stride or offset is a silent wrong answer for any caller that passes a non-default value. The `workspace-addressing-honored` lint rule enforces this for workspace arguments only. For matrices, vectors and packed arrays, the only guard is the harness's layout fuzzing, which covers a minority of routines. With `noUnusedParameters`, `tsc` reports 82 unread `base.js` parameters. Most are workspace strides ignored by design (unit-stride workspaces), and that noise hides the real ones.

## Evidence

- `zlaqr5` ignores `strideS` and reads the shifts at unit stride.
- `ztgsna` ignores `strideVL1`/`strideVR1`.
- Past instances, found only by the harness:
  - LEARNINGS.md #21: `zlatps` ignored `strideAP`;
  - LEARNINGS.md #26: `zpptri` ignored the packed stride;
  - LEARNINGS.md #47: `ztgevc` ignored `offsetWork`/`strideWork`.
- Unread locals include `dtrevc` `allv`, possibly a missing branch.

## Reproduce

```bash
node -e 'const b=require("./tsconfig.json");Object.assign(b.compilerOptions,JSON.parse(process.argv[1]));require("fs").writeFileSync("tsconfig.probe.json",JSON.stringify(b))' '{"noUnusedParameters":true,"noUnusedLocals":true}' && npx tsc -p tsconfig.probe.json | grep -vE 'stride(Work|IWork|Iwork|RWork|Bwork)'; rm -f tsconfig.probe.json
```
