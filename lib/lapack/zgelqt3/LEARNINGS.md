# zgelqt3: Translation Learnings

## Translation pitfalls

- Almost a mechanical translation of `dgelqt3`. The structural rule is:
  every `'transpose'` flag in the `dgelqt3` ZTRMM/ZGEMM calls that operates
  on a V or A block becomes `'conjugate-transpose'` here, but the flags that
  multiply by T1/T2 (upper triangular) or apply V/V1 from the right with no
  transpose stay `'no-transpose'`. The pattern is "wherever the real version
  used `^T` of the V matrix, the complex version uses `^H`."
- The Fortran writes `T(1,1) = CONJG(T(1,1))` immediately after the
  `M = 1` ZLARFG call. Translating naively without this conjugation makes
  the `m1_n1` and `m1_n4` cases fail by a single sign on the imaginary part
  of tau. The recursive case also depends on this conjugation because the
  bottom-half recursion reads the just-written T diagonal.
- The Fortran line `T(J, I+M1) = (A(J, I+M1))` uses a redundant pair of
  parentheses that look like they might invoke an implicit operator, but
  Fortran has no such operator — it is a plain copy (CONJG would have to
  be explicit). I left a comment in `base.js` noting this so a future
  reader doesn't second-guess and add a spurious conjugation.

## Dependency interface surprises

- `zgemm` and `ztrmm` accept `Complex128` scalars for `alpha`/`beta`
  (not raw doubles). I hoisted `CONE` and `CNEG_ONE` to module scope to
  avoid per-call allocation.
- All three of `zlarfg`, `zgemm`, `ztrmm` use **complex-element strides
  and offsets** at their public boundary — the same convention as `base.js`
  here. No conversion is needed when forwarding offsets; the `*2`
  conversion only happens inside `base.js` when manually walking the
  Float64 view for the in-block copies and the in-place subtraction.
- Followed `ztplqt2`'s pattern of doing the `reinterpret(...)` and
  `*2` work once at the top of the M >= 2 branch (not at every kernel
  call) since the kernels do their own reinterprets internally.

## Complex number handling

- The two manual blocks (Step 1 copy of A→T workspace, Step 7 in-place
  A -= T_buf with zeroing) are the only places that touch the Float64
  view directly. Everything else goes through `zgemm`/`ztrmm`/`zlarfg`,
  which do their own reinterpret. I considered a single inlined
  conjugate of the diagonal tau in the M=1 branch — this is just `Tv[idx+1] = -Tv[idx+1]`, no need for a `cmplx.conj` call.

## Coverage

- 100% line / 100% branch / 100% function on `base.js` with the eight
  fixture cases (M=1 base case, M=1 degenerate, plus M=2/3/4/5 with
  varying split balances and a square M=N=4) plus stride/offset and
  row-major variations. The M=0 quick return is exercised separately.

## Test fixture

- The Fortran test uses `complex*16 :: A(M, N)` declared at exact size
  (no NMAX padding) so the `EQUIVALENCE`-based interleaved-real printout
  maps directly to a packed `Complex128Array` for the JS side. This
  avoids the leading-dimension/EQUIVALENCE stride pitfall called out in
  the project translation skill.
