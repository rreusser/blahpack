# ztgsen: Translation Learnings

## Translation pitfalls

- **Conjugate-transpose B-matrix swap in DIF estimation (wantd2 branch):**
  In the zlacn2-based DIF estimation loops (IJOB=3 or IJOB=5), the
  conjugate-transpose case (KASE=2) swaps the B-block arguments compared
  to the no-transpose case (KASE=1). For the second DIF estimate, KASE=1
  uses D=B(I,I), E=B, but KASE=2 uses D=B, E=B(I,I). This asymmetry is
  easy to miss because the A-block arguments are the same in both cases.
  Getting this wrong produces plausible-looking but incorrect DIF values.

- **Output scalar returns:** ztgsen has output scalars M, PL, PR that
  cannot be modified via reference in JS. The function returns these in
  an object `{ info, m, pl, pr }`. DIF is returned via the Float64Array
  parameter.

## Dependency interface surprises

- **zlassq returns an object** `{ scl, sumsq }` rather than modifying
  array parameters. This differs from ztgsyl which writes to
  Float64Array output params `scale[0]` and `dif[0]`.

- **ztgexc returns** `{ ifst, ilst, info }` rather than a plain integer.

- **ztgsyl with ijob=0** does NOT write to the `dif` parameter. This is
  important for the zlacn2 reverse-communication loop where `DIFV` serves
  double duty as both the EST for zlacn2 and the dif output for ztgsyl.

## Complex number handling

- The normalizeB helper uses `cmplx.absAt()` for safe complex absolute
  value and `zscal` with `Complex128` scalars for row/column scaling.
  Conjugation is computed via sign flip: `new Complex128(re/d, -im/d)`.

## Workspace

- WORK and IWORK are allocated internally. The caller-supplied arrays
  are ignored. This simplifies the interface at the cost of allocation.

- The zlacn2 workspace layout overlaps with ztgsyl workspace:
  X = WK[0..mn2-1], V = WK[mn2..2*mn2-1], ztgsyl WORK = WK[2*n1*n2..].
  Since mn2 = 2*n1*n2, V and ztgsyl WORK overlap. This is safe because
  V is always overwritten before being read in each zlacn2 iteration.
