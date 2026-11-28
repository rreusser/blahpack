# dla_gbamv: Translation Learnings

## Translation pitfalls

- **Two distinct inner-loop X indexing schemes.** `dla_gbamv.f` splits on
  `INCX.EQ.1`. In the INCX=1 branch, the inner loop uses `X(J)` directly
  where `J` ranges over the matrix column indices (`MAX(I-KL,1)..MIN(I+KU,LENX)`),
  i.e. `x` is indexed by matrix column. In the general branch, `JX` is
  re-initialized to `KX` (the start of `x`) on **every row** and
  incremented by `INCX` only during the inner-loop iterations. These two
  branches produce mathematically different results for the same inputs
  (e.g. a mid-rows row with `j0>0`). We replicate both exactly: the JS
  base.js has a `strideX === 1` branch (`jx = offsetX + j`) and a general
  branch (`jx = offsetX` then `jx += strideX`). This faithfully matches
  the Fortran reference and the fixture data.

- **Banded transpose indexing.** The Fortran `AB(KE-I+J, I)` with
  `KE = KL+1` simplifies to 0-based band row `kl + j - i`, column `i`.
  This is different from what you might first write by analogy to the
  non-transposed `ku + i - j` formula. The test fixture with three KL/KU
  configurations and transpose cases caught two indexing attempts.

- **LDAB declaration in the Fortran test.** The test program originally
  declared `AB(10, 10)` but called the routine with `LDAB=3`. The
  routine indexes using its own LDAB, so the fixture values came out as
  garbage aligned to a different stride. Fix: declare `AB(3, 10)` so the
  Fortran array's leading dimension matches the LDAB passed to the
  routine. This is the same "leading dimension vs declared dimension"
  trap that the skill warns about for EQUIVALENCE printing, but here it
  manifests through the routine itself reading the wrong columns.

## Dependency interface surprises

- Only `dlamch('Safe minimum')` is required at runtime. `ilatrans` is
  replaced by direct JS string comparison (`trans === 'no-transpose'`),
  so there is no JS dependency on an `ilatrans` module.
