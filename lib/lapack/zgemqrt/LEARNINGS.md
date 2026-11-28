# zgemqrt: Translation Learnings

Z-prefix pendant of `dgemqrt`. The applier for compact-WY block reflectors
is a thin dispatch over `zlarfb`, so almost all of the new work was
parameter wiring and Fortran fixture authoring.

## Translation pitfalls

- `trans` for unitary routines must be `'no-transpose'` or
  `'conjugate-transpose'` — NEVER plain `'transpose'`. The base.js
  dispatch only matches those two; if a caller accidentally passes
  `'transpose'` (the legitimate token for symmetric/real routines)
  none of the four `if` branches fire and the routine silently no-ops
  (returns 0 with C unchanged). Both `lib/zgemqrt.js` and
  `lib/ndarray.js` therefore add an explicit positive-trans check that
  rejects `'transpose'` even though `isTransposeOperation('transpose')`
  is true. Mirror this for every z-applier.
- The Fortran reference uses `LSAME(TRANS,'C')` for the conjugate-
  transpose path — the JS string equivalent is `'conjugate-transpose'`,
  not `'C'`. Easy to miss when porting from the dgemqrt source.
- The block-iteration direction is identical to dgemqrt: forward for
  (left, conjugate-transpose) and (right, no-transpose); backward
  otherwise. The `kf = floor((K-1)/nb)*nb` last-block start formula
  and the `(i*sV1) + (i*sV2)` diagonal V offset translate verbatim.

## Dependency interface surprises

- `zlarfb` takes complex-element strides and a 2D WORK
  (`strideWORK1`, `strideWORK2`, `offsetWORK`). Its convention here is
  identical to `dlarfb`: WORK is laid out as `ldwork`-by-`nb` with
  leading dim `ldwork = max(1,N)` (left) or `max(1,M)` (right). The
  applier presents WORK as a 1D buffer with a single `strideWORK` and
  internally sets `sw1 = strideWORK`, `sw2 = ldwork * strideWORK`.
  When the caller's WORK is too small (or null), an internal
  Complex128Array is allocated and `sw1=1`, `sw2=ldwork`.
- `zlarfb` requires `direct='forward'` and `storev='columnwise'` for
  the QR-style compact-WY layout produced by `zgeqrt` — same as the
  Fortran reference. Do not "simplify" by trying other DIRECT/STOREV
  values; only those four entry points are exercised by zgemqrt.

## Complex number handling

- `base.js` does not call `reinterpret()` itself — Complex128Arrays
  flow straight through to `zlarfb` which handles its own
  reinterpret. The gate emits a `WARN  z-prefix uses reinterpret()`
  for this routine; the warning is acceptable for pure dispatcher
  modules that delegate the actual element-level math.
- The Fortran test relies on `EQUIVALENCE` to print interleaved
  re/im pairs. Container sizes deliberately match the trimmed `N`
  for each test case to avoid the LDA-vs-EQUIVALENCE-stride trap
  documented in the SKILL.

## Coverage

- `base.js` reaches 100% line / 94.44% branch coverage. The lone
  uncovered branch is the `WORK || WORK.length < need` short-circuit
  for the auto-allocation path; both directions are covered by the
  `WORK auto-allocation` and the small-buffer test.

## Process notes

- `python bin/init_routine.py` generated a `deps_zgemqrt.txt` with
  only the direct deps (`zlarfb`, plus its leaves). For the Fortran
  test program (which needs `zgeqrt` to produce V/T) we had to
  expand the deps file by hand to include `zgeqrt`/`zgeqrt2`/
  `zgeqrt3`/`zlarfg`/`zladiv`/`dladiv`/`dlapy3`/`zgemv`/`zgerc`/
  `ztrmv`/`zscal`/`zdscal`/`dznrm2`/`dlamch`/`zlacgv` so the
  link succeeds. The blas leaves (`zgemm`, `ztrmm`, `zcopy`) are
  pulled from the system BLAS by `run_fortran.sh`.
- For complex appliers, do NOT use `'dtype': 'float64'` in the
  scaffolded benchmark — change to `'complex128'` so `uniform()`
  returns a `Complex128Array`. The scaffold's `'float64'` default
  silently feeds Float64Arrays into a routine expecting
  Complex128Array (no immediate type error since reinterpret accepts
  any typed-array buffer, but every result is wrong).
