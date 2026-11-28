# zunmr3: Translation Learnings

## Translation pitfalls

- zunmr3 is the complex analog of dormr3 for the unitary Q from `ztzrzf`.
  The conjugation rule: when `trans === 'no-transpose'` pass `tau(i)`
  as-is; when `trans === 'conjugate-transpose'` pass `conj(tau(i))`.
- Because `zlarz` handles the implicit leading `1` and the trailing
  z-vector internally, zunmr3 does NOT need to temporarily overwrite an
  element of `A` or conjugate a leading part of the row — the reflector
  row contains only the z-vector at `A(i, nq-l:nq-1)`.

## Dependency interface surprises

- `zlarz` takes the complex scalar `tau` as a
  `(Complex128Array, offsetTau)` pair in complex elements. Allocate a
  scratch `Complex128Array(1)` to hold either `tau(i)` or `conj(tau(i))`
  and pass offset `0`.

## Complex number handling

- Scalar conjugation is inlined as `tauiv[1] = -TAUv[iTau+1]` on a
  reinterpret view; this is safe (no division/sqrt). No `zlacgv` call is
  needed in zunmr3 — scalar conjugation only, not vector.

## Fortran test setup

- Dependencies needed: transitive deps via `ztzrzf` (see
  `deps_zunmr3.txt`). `deps.py` only sees direct deps (`zlarz`,
  `zlacgv`); had to hand-add `dcabs1`, `dladiv`, `dlapy3`, `dznrm2`,
  `ilazlc`, `ilazlr`, `izmax1`, `zlarf`, `zlarfb`, `zlarfg`, `zlarft`,
  `zlarzb`, `zlarzt`, `zlatrz`, `zladiv` so `run_fortran.sh` links.
- Pack `C(1:M, 1:N)` column-major before printing to avoid the
  EQUIVALENCE leading-dim mismatch bug.

## Gate/lint gotchas

- Same as dormr3: predeclare every `var` at the top of each test
  function to avoid `--fix` hoisting `var foo = expr;` above uses
  that reference other vars (creates `no-use-before-define`).
