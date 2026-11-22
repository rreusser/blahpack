---
id: 0060
title: Workspace-allocating wrappers can allocate too little, because nothing checks that the size is sufficient (D5c)
status: open
area: wrappers
opened: 2026-11-22
---

## Problem

CONVENTIONS D5c: a `<routine>.js` wrapper "must accept `null` and then allocate a **sufficient** workspace". Its listed enforcers check the signature (no stride), the JSDoc (`T|null`), and that a null branch exists (`conf:work-autoalloc`). None checks that the allocation is large enough. Ten wrappers allocate a workspace of length 1, under a comment asking to "set correct size". Typed arrays silently drop out-of-range writes, so calling these public wrappers with `WORK = null` returns wrong results without any error.

## Evidence

- `dlarf.js`, `dopmtr.js`, `dorm2l.js`, `dorm2r.js`, `dorml2.js`, `dormr2.js`, `dormr3.js`, `dtpmqrt.js`, `dtprfb.js` (`new Float64Array( 1 )`) and `zgemqrt.js` (`new Complex128Array( 1 )`), each with a "set correct size" comment. The placeholders came from the bulk caller-owns-WORK codemod (d9987da56).
- `dlarf( 'column-major', 'left', 3, 3, v, 1, 1.5, C, 3, null )` returns NaN in 6 of its 9 outputs. With `new Float64Array( 3 )` the same call is correct.
- Found by the code-comment check for ticket 0055: that comment was the only record of the problem.
- A general enforcer would call each wrapper with `WORK = null` and with an ample workspace on the same inputs, and require identical results.

## Reproduce

```bash
grep -rn "set correct size" lib/*/base/*/lib/*.js | wc -l
```
