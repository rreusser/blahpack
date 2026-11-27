# dgeevx: Translation Learnings

## Scope: `sense` restricted to `'none'`

`dgeevx` is the expert driver for nonsymmetric real eigenproblems, adding
balancing, eigenvalue/eigenvector condition numbers, and explicit ILO/IHI
reporting on top of `dgeev`. The condition-number path (`sense !== 'none'`)
depends on `dtrsna`, which has not yet been translated. Rather than stubbing
or partially implementing `dtrsna`, the JS `dgeevx` throws a clear
"not implemented" error when `sense !== 'none'` and the `RCONDE`/`RCONDV`
arrays are only touched in the N=1 quick-return fast path. The control flow
and undo-scaling logic otherwise mirrors the Fortran reference line-for-line.

## Returning ILO/IHI/ABNRM as an object

The Fortran `ILO`, `IHI`, and `ABNRM` are in/out scalars. In the JS
translation they are lifted out of the parameter list and returned as part of
the result object `{ info, ilo, ihi, abnrm }`. This keeps the parameter list
smaller and matches how other JS drivers handle bal-style outputs (e.g.
`dgebal` already returns `{ info, ilo, ihi }`). Note that this diverges from
the mechanical signature the scaffolder generates (32 params vs. the expected
35), which triggers a `stdlib/signature-conformance` warning — accepted as a
translator-intent override.

## LWORK is internal

LWORK-related workspace is entirely internal: `TAU` is `N` elements, general
`WORK` is `max(4*N, 1)`, and `TREVC_WORK` is `3*N`. Users do not pass a
workspace, which simplifies the interface dramatically. `SCALE` is still
caller-supplied because it is both output (populated by `dgebal`) and needed
again later by `dgebak`.

## Fortran test linking needs dtrsna + transitive deps

Even though the JS only exercises `sense='none'`, the Fortran `test_dgeevx`
program links the reference `dgeevx.f` which contains a `CALL DTRSNA` in its
source. The linker therefore requires `dtrsna` and its full transitive
closure: `dlaqtr`, `dtrexc`, `dlaexc`, `dlaln2`, `dladiv`, `dlasy2`, `dlarfx`,
`dlacn2`, plus the `la_xisnan` module. These must be listed in
`test/fortran/deps_dgeevx.txt` even though none of them appear in the JS
dependency tree.

## `dlange` norm constants

`dlange` uses the full-word flags `'max'`, `'one-norm'`, `'inf-norm'`,
`'frobenius'` — not single letters and not `'one'`. Typing `'one'` silently
falls through and returns 0, which would corrupt `abnrm`.
