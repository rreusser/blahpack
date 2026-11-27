# zlahef_rk: Translation Learnings

## Translation pitfalls

- **Diagonal realness enforcement is pervasive.** Hermitian routines must force imaginary parts of diagonal entries to zero at three distinct points: (a) after writing `W(k,kw) = real(A(k,k))` during the column copy, (b) after every `zgemv` update that touches a diagonal entry (the complex arithmetic can introduce tiny nonzero imaginary noise), and (c) before and after every trailing-block `zgemv` in the U12/L21 update loop. Forgetting any of these produces slightly imaginary diagonals that propagate through subsequent pivots.
- **The 2x2 division pattern flips between upper and lower.** Fortran:
    - Upper: `D11 = W(k,kw) / conj(D21)` and `D22 = W(k-1,kw-1) / D21`; `A(j,k-1) /= D21`; `A(j,k) /= conj(D21)`.
    - Lower: `D11 = W(k+1,k+1) / D21` and `D22 = W(k,k) / conj(D21)`; `A(j,k) /= conj(D21)`; `A(j,k+1) /= D21`.
    The reason is that the stored off-diagonal is the subdiagonal in the lower case and the superdiagonal in the upper case, and they are conjugates of each other.
- **E stores the raw 2x2 off-diagonal without conjugation.** `E(k) = W(k-1, kw)` (upper) and `E(k) = W(k+1, k)` (lower). Do not conjugate when copying into E. The `_rk` format consumers (zhetri_3, zhetrs_3) assume this orientation.
- **Do not store W's 2x2 superdiagonal entry in A.** The Fortran explicitly sets `A(k-1, k) = CZERO` (upper) and `A(k+1, k) = CZERO` (lower) after the 2x2 pivot block; the off-diagonal lives exclusively in E. This is the distinguishing feature of the `_rk` storage format.
- **Zero-column quick-return path still writes a real diagonal.** When `max(absakk, colmax) == 0`, the Fortran sets `A(k,k) = DBLE(W(k,kw))` and copies the W column into A. The JS port must replicate this (copy and force imag=0), not just `kp = k` and continue.
- **`zlacgv` on zero-length strided arrays.** When `k=1` in the upper loop the second `zlacgv(k-1, ...)` call receives count=0; guard with `if (k-1 > 0)`. The same applies to the lower-case `zlacgv(N-2-k, ...)` call at the end of the 2x2 block.
- **Inlined complex division sign traps.** The division `X / conj(D21)` = `X * D21 / |D21|^2`, while `X / D21` = `X * conj(D21) / |D21|^2`. I double-checked every imaginary sign by writing the math out above each assignment. One sign flip produces subtly wrong (but not obviously wrong) results because many test matrices are nearly self-conjugate.

## Dependency interface surprises

- **`zgemv` and `zgemm` take `Complex128` scalars.** Use the module-level `CONE`/`NEGCONE`; passing `-1.0` or `new Float64Array([-1, 0])` is a silent coercion bug.
- **zlacgv signature.** `zlacgv(n, X, strideX, offsetX)` uses complex-element strides (not doubled).

## Testing

- **Use a `buildMatrix(n, entries)` helper with `(i, j, re, im)` tuples.** Makes the Hermitian test setup auditable vs. hand-writing `view[2*(i+j*n)] = re; view[2*(i+j*n)+1] = im;` for every entry.
- **EQUIVALENCE stride trap.** When `NMAX != n`, printing via EQUIVALENCE from an `A(NMAX, NMAX)` array reads the padded layout (including zero-padding between data columns). I declared separate `A6` / `A4` arrays for the 6x6 and 4x4 test cases to avoid this.

## Gate config exceptions

Added `lib/lapack/base/zlahef_rk` exception for `scaffolding.no-todo-readme`, `scaffolding.index-example`, and `tests.assertion-count`, with the same rationale as `dlasyf_rk`.
