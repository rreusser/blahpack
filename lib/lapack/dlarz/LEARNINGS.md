# dlarz: Translation Learnings

## Translation pitfalls

- `dlarz` is structurally very similar to `dlarf`, but the reflector is
  stored with an implicit leading identity: `v = [ 1; 0; ...; 0; z ]` and
  only the trailing `l`-vector `z` is explicit. The update touches only
  the first row (side='left') / column (side='right') of `C` and the
  trailing `l` rows/columns — never the interior "zero" block. This
  means the translation is a direct port of four BLAS calls, with no
  `iladlr`/`iladlc` last-nonzero scan (unlike `dlarf`).
- `L = 0` is a legitimate, testable path: the `dgemv` and `dger` calls
  are skipped, but `dcopy` + `daxpy` still run, producing a simple
  rank-one scaling of the first row (or column) of `C`. The Fortran
  reference permits this and the Fortran test covers it.
- The Fortran `C(M-L+1, 1)` offset maps to
  `offsetC + (M-l) * strideC1` in ndarray form (and similarly
  `C(1, N-L+1)` → `offsetC + (N-l) * strideC2`). This is independent of
  layout and needs only the slower stride for the "moving" dimension.

## Dependency interface surprises

- `dcopy`/`daxpy`/`dgemv`/`dger` are thin BLAS primitives — no surprises.
  `dgemv` accepts long-form `'transpose'` / `'no-transpose'` strings in
  the blahpack port.

## Coverage / testing notes

- All six Fortran fixture cases were already present
  (`test/fixtures/dlarz.jsonl`, generated from
  `test/fortran/test_dlarz.f90`). The scaffold `gen_test.py` output was
  written into `test/test.js` by the init routine, but the correct home
  for fixture-based tests is `test/test.ndarray.js`; `test/test.js` is
  reserved for main-export checks, so the fixture tests were relocated
  during this translation.
- base.js reaches 100% line and branch coverage with the fixture suite
  plus two synthesized cases (`right L=0`, `right tau=0 quick return`).

## Automation / process notes

- The `stdlib/signature-conformance` lint rule reports a warning for
  `dlarz` because the Fortran signature parser counts Fortran parameters
  (12) against the JS signature (15) and does not realize `WORK` in
  blahpack expands to `(WORK, strideWORK, offsetWORK)`. The warning is
  benign and appears on other routines with a trailing `WORK` vector as
  well.
- `init_routine.py` pre-populated `test/test.js` with the fixture
  scaffold. Gate check `tests.assertion-count` specifically inspects
  `test/test.js`, so care is needed when moving fixture-based tests out.
