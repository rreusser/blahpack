# zgsvj0: Translation Learnings

## Algorithmic differences vs. dgsvj0

The complex `zgsvj0` is structurally **simpler** than the real `dgsvj0` despite
being longer in Fortran lines:

- `dgsvj0` carries a real-valued `D` that *scales* `A`. Rotations work on the
  scaled matrix `A*diag(D)` and the inner-loop body has an elaborate set of
  branches (FAST rotation vs `daxpy` updates, `d[p]>=1` cases, etc.) to
  maintain that scaling.
- `zgsvj0` carries a complex `D` that is purely a **phase accumulator**. `D`
  is updated *only* at the end of a rotation via `D(p) = -D(q)*ompq` and is
  never read inside any inner computation. Rotations apply directly to
  `A(:,p)`/`A(:,q)` via `zrot` with `cs` (real) and `conj(ompq)*sn` (complex
  sine). No d-scaling branches exist.

Implication: do **not** mechanically port the dgsvj0 branch tree. The
complex routine's inner body is just three branches:
1. `|theta| > bigtheta`: trivial `zrot` with `cs=1, sn=t`.
2. otherwise: solve quadratic for `t`, then `zrot(cs, conj(ompq)*sn)`.
3. `rotok==false`: modified Gram-Schmidt update via `zaxpy`.

## Numerical reproducibility of `D` against the Fortran reference

`D` is a chain of unit-modulus complex multiplications by `ompq = aapq /
|aapq|`. Small differences from the Fortran reference accumulate over
sweeps in the angle of each `D[i]`, while preserving unit modulus. After
3–5 sweeps the relative error in real/imag parts of `D` ranges from
1e-10 to 1e-6.

Sources of divergence include:
- Order of two real divisions: Fortran computes
  `AAPQ = (ZDOTC/AAQQ)/AAPP`, JS doing `dotZ/(aaqq*aapp)` differs at one
  ULP per call.
- `Math.hypot(re, im)` vs `sqrt(re*re + im*im)` for the modulus.
- The summation order inside `zdotc`.

`A`, `V`, and `SVA` all match the fixture to 1e-10 or better — those are
the load-bearing outputs of the routine. We relax `D` tolerance to 1e-6
in the fixture tests with an inline comment.

## Dependency interface surprises

- **`zrot` sine is `Float64Array(2)`**, not a `Complex128`. We allocate a
  single 2-element scratch buffer at function entry and reuse it across
  all rotations. We assign `[ompqR*t, -ompqI*t]` (the `-ompqI` encodes
  the `CONJG(OMPQ)` from the Fortran).
- **`zlassq` returns `{ scl, sumsq }`**, not a 2-element array. Norm
  recomputation uses `res.scl * Math.sqrt(res.sumsq)`.
- **`zlascl` takes a `type` string** (`'general'`, not `'G'`). Same
  signature as `dlascl` but on `Complex128Array` with complex-element
  strides.
- **`dznrm2` does NOT require the d-scale**. In `dgsvj0` the column norm
  was `dnrm2(A(:,p))*D(p)`; here `D` doesn't scale `A`, so it's just
  `dznrm2(A(:,p))`.

## Complex number handling

- `d` is the only complex array we index directly via the Float64 view
  (`dv = reinterpret(d, 0)`). We read/write `dv[ dp0 ]` and `dv[ dp0+1 ]`
  as the (re, im) pair, where `dp0 = (offsetD + (p-1)*strideD) * 2`.
- `A`, `V`, `work` are *never* indexed directly — they're handed to
  `zcopy`/`zdotc`/`zrot`/`zaxpy`/`zswap`/`zlascl`/`zlassq` with
  complex-element strides and offsets.
- The `D(p) = -D(q) * OMPQ` update has the negation applied AFTER the
  multiply: `newDpR = dqR*ompqR - dqI*ompqI; dv[dp0] = -newDpR`. Don't
  fuse the negation into `ompq` — that would also affect the `zrot`
  argument since `conj(ompq)*sn` is recomputed separately.

## Fortran test gotcha

Fortran 2D arrays `A(LDA, *)` with EQUIVALENCE-printing: when the test
matrix is M-by-N and we declare `A(LDA, NMAX)` with LDA=M, the memory
layout is contiguous M-by-N when LDA equals M. We chose `M=LDA` in every
test case so `print_array('a', a_r, 2*M*N)` reads contiguous data.

## Process notes

- `python bin/init_routine.py` generated incorrect scaffolds for
  `zgsvj0.js` (wrong arity in test scaffold) and `test.zgsvj0.js`
  (didn't know about the second `jobv` string argument). The translator
  must hand-rewrite the layout-wrapper tests after scaffolding.
- The `signature-conformance` warning ("expected 22 params") is expected
  for routines that surface `lwork` + `work` strides/offset as four
  explicit JS params — there's no way to satisfy the pattern without
  changing project convention.
