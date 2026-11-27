---
id: 0129
title: Some ASCII matrices in the README reference notes render as text blocks instead of KaTeX
status: open
area: general
opened: 2026-11-27
---

## Problem

`bin/fortran-docs.mjs` converts column-aligned ASCII matrices in the reference
Fortran prologues to `pmatrix`/`bmatrix` (`asciiMatrix()`), but only when every
row carries its brackets in the same columns and nothing but blank space sits
outside them on the other rows. Anything else falls back to a ```text block, so
some matrices in the README "Reference notes" (and the docs site) show as
monospaced ASCII instead of typeset math. The formatting of these remaining
blocks needs investigating: which shapes are common enough to convert, and
which should stay verbatim.

## Evidence

Of the 472 text blocks in the 852 README blocks, 169 contain bracketed rows.
Shapes seen so far:

- Labeled block matrices, with row/column labels outside the brackets:
  `dggsvp3` (`K ( 0 A12 A13 )`, column labels `N-K-L K L` above), `dsptrf`
  (`U(k) = ( I v 0 ) k-s`, sizes below).
- Elided entries drawn as `. . .` inside or below the matrix: `dlarzt`.
- Partitioned matrices with `|` and `-----` rules: `dgetrf2`.
- Side-by-side diagrams with a header line (`if UPLO = 'U':   if UPLO = 'L':`):
  `zhetrd`, `dsytrd` (the matrices convert; the header stays a text block).
- RFP storage layouts (`dtftri`, `dpftrf`): index grids that should probably
  stay verbatim.

A likely fix for the labeled cases is `\begin{array}` with the labels as an
extra row/column.

## Reproduce

```bash
node bin/fortran-docs.mjs --readme --all --report   # "textBlocks" count
grep -l '```text' lib/*/base/*/README.md
```
