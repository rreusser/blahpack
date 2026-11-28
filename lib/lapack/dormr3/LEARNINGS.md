# dormr3: Translation Learnings

## Translation pitfalls

- dormr3 is structurally parallel to dormr2 but uses `dlarz` (RZ-form
  reflectors with an implicit 1 and a trailing `l`-vector) instead of
  `dlarf`. The `l` parameter is the length of the trailing z-vector, and
  the meaningful part starts at column `ja = nq - l` (0-based) of row `i`
  of `A`, where `nq = M` for `side='left'` and `nq = N` for `side='right'`.
- Unlike dormr2, `A[i, nq-K+i]` is NOT temporarily overwritten with 1.0:
  the implicit `1` lives at `A(i, i)` on the diagonal (index `ja - l + i`
  in Fortran row-wise terms) but dlarz never reads it, so no save/restore
  is needed.
- The iteration direction logic is identical to dormr2:
  `(left && trans) || (!left && notrans)` -> forward;
  `(left && notrans) || (!left && trans)` -> backward.

## Dependency interface surprises

- `dlarz` reads the reflector z-vector via `(v, strideV, offsetV)` with
  stride-1 semantics. For an RZ row-stored reflector we pass
  `strideV = strideA2` and `offsetV = offsetA + i*strideA1 + ja*strideA2`.
- `dlarz` signature differs from `dlarf` in accepting an extra leading
  `l` parameter (number of meaningful trailing entries of v).

## Fortran test setup

- The Fortran test generates A/TAU via `dtzrzf`, which required adding
  `dlarfb`, `dlarft`, `dlarzb`, `dlarzt`, `dlatrz` to `deps_dormr3.txt`
  — `deps.py` doesn't see these transitively because `dtzrzf` is not a
  direct JS dependency.

## Gate/lint gotchas

- `bin/lint-fix.sh` skips lint errors in benchmark/test files if base.js
  and ndarray.js pass — but `bin/conformance.js` runs ESLint over the whole
  module directory, so any error anywhere blocks the gate.
- ESLint `--fix` can hoist `var` declarations above their initializers
  in ways that create `no-use-before-define` errors. Pre-declare all
  vars at the top of every test function before calling `--fix`.
