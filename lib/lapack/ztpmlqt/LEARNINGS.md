# ztpmlqt: Translation Learnings

## Translation pitfalls

- **Mirror dtpmlqt directly, only flip transpose vocabulary.** The
  Fortran `ztpmlqt.f` has identical control structure to `dtpmlqt.f`
  modulo `'T'`/`'C'` swaps. The four (side, trans) cases dispatch to
  ztprfb with `'L','C'`, `'R','N'`, `'L','N'`, `'R','C'` for outer
  trans `'N'`, `'C'`, `'C'`, `'N'` respectively — same flip pattern as
  the real version (T<->N becomes C<->N here).
- **`LB = 0` in both left-side branches** (same as dtpmlqt) — the
  trapezoidal contribution vanishes from the left-side reflectors. The
  right-side branches use the familiar `LB = NB - N + L - I + 1`
  formula. Translating LB blindly from a QR sister will be wrong.
- **V is K-by-M (or K-by-N), stored row-wise.** The per-block V offset
  is `i * strideV1` (row stride), not `i * strideV2`. This mirrors
  dtpmlqt and is opposite the QR appliers. The wrapper validator must
  enforce LDV >= K (column-major).
- **Reject plain `'transpose'`** in both `ndarray.js` and `ztpmlqt.js`
  validators (Q is unitary, only `'no-transpose'` and
  `'conjugate-transpose'` are valid). Modeled on `zgemlqt`/`zgemqrt`
  pattern: `!isTransposeOperation(trans) || trans === 'transpose'`.

## Dependency interface surprises

- **`ztprfb` uses complex-element strides directly** (no `*2` doubling).
  The four-stride API (`strideWORK1`, `strideWORK2`) means we partition
  the user's flat-stride WORK into row/column strides:
  `sw1 = strideWORK; sw2 = ldwork * strideWORK`. Same pattern as
  dtpmlqt's WORK splitting for dtprfb.

## Fortran test compilation

- `deps.py` returns only `ztprfb` for ztpmlqt, but the Fortran test
  also calls `ztplqt` to build V/T. The deps file must additionally
  include `ztplqt`, `ztplqt2`, `dladiv`, `dlamch`, `dlapy3`, `ieeeck`,
  `iparmq`, `ilaenv`, `zlarfb`, `zlarfg`, `zlacgv`, `zladiv`. Without
  `zlacgv`, `zlarfb` linkage fails (it conjugates V rows for rowwise
  application).

## Complex number handling

- The base.js does not need `reinterpret()` itself — all complex
  arithmetic is delegated to `ztprfb`, which handles the heavy lifting.
  The gate's "z-prefix uses reinterpret()" warning is a false positive
  here; the routine is purely a dispatcher over (side, trans) that
  passes Complex128Array views through to the kernel.
- Internal WORK fallback uses `new Complex128Array( ldwork * ncwork )`
  (vs. `Float64Array` in dtpmlqt). Sizing matches Fortran: `N*MB`
  complex elements (`side='left'`) or `M*MB` (`side='right'`).

## Fortran test pitfall

- **Local variable `AD` in `run_case_D` collided with a BLAS
  global.** Renamed to `ADL`/`ADR` to avoid Fortran's symbol-table
  collision with the BLAS routine. (No equivalent issue for
  `dtpmlqt` because the Fortran symbol table happened not to expose
  the same conflict for `AE`/etc.) Watch for two-letter test
  variables shadowing standard routine names when copying complex
  test scaffolds.

## Coverage

- `base.js` reaches 100% line / 100% branch with the test suite. No
  unreachable branches because each (side, trans) combination has a
  fixture-backed test, and the WORK fallback path is hit by both
  `null WORK` and undersized-WORK tests for both sides.
