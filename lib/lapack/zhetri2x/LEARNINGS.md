# zhetri2x: Translation Learnings

## Translation pitfalls

- The Fortran `ZTRTRI(UPLO,'U',...)` argument list is `(UPLO, DIAG, N, A, LDA, INFO)`. The literal `'U'` is the DIAG argument (`'unit'` triangular), not a second UPLO. Both upper and lower branches call `ZTRTRI` with DIAG=`'unit'` because the Bunch-Kaufman factor U (or L) has unit diagonal. Translating this as `'upper'` for both branches is the canonical bug for this routine — guard the second argument as `'unit'`.
- The Fortran 2D WORK array `WORK(N+NB+1, NB+3)` is exposed as a 1D `Complex128Array` plus a row stride (`strideWORK`, typically `1`). The column stride is `ldwork * strideWORK` where `ldwork = N + nb + 1`. Inside the routine we maintain `sw1 = strideWORK*2` for the row stride and `sw2 = ldwork * sw1` for the column stride (both doubled for Float64 view access).
- `U11 = N` in Fortran is 1-based meaning rows N+1..N+NNB. In 0-based JS, set `u11 = N - 1` so `u11 + 1 + i` walks the correct rows.
- The 2x2 pivot inverse for Hermitian D differs subtly from symmetric: the diagonal entries `WORK(K,INVD)` and `WORK(K+1,INVD+1)` are real-valued; the off-diagonal entries are complex with `WORK(K+1,INVD) = conj(WORK(K,INVD+1))`. Symmetric assignment uses the same (non-conjugated) value.
- Lower-triangle 2x2 invD * L21 multiplication (Fortran lines 476-483) crosses indices: row `i-1` uses `WORK(CUT+NNB+I-1, INVD+1)` (off-diagonal) multiplied by `U01_I_J` and `WORK(CUT+NNB+I-1, INVD)` (diagonal) multiplied by `U01_IP1_J`. The Fortran ordering swaps the columns of invD between the two output rows — be careful not to accidentally mirror them.

## Dependency interface surprises

- `zsyconv` takes a separate `E` array (interface), but the Fortran caller passes WORK as that array. We follow suit, passing `(WORK, strideWORK, offsetWORK)` for the E parameter. The conversion writes off-diagonals into the first WORK column (column 0).
- `zheswapr(uplo, N, A, sA1, sA2, oA, i1, i2)` takes 0-based `i1`, `i2`. The Fortran call passes 1-based `I` and `IP`; in JS we subtract 1 before calling. Convention: pivot indices fed to `zheswapr` are 0-based, matching the rest of the codebase.
- `ztrmm`/`zgemm` use `'conjugate-transpose'` for `transA='C'`. Translating `'C'` as `'transpose'` is silently wrong — both pass validators but produce a different operation for complex data.

## Complex number handling

- Hot inner loops avoid `cmplx.mul`/`Complex128` allocations and instead inline 4-multiply-2-add complex multiplies on the reinterpreted Float64 view. This matches the project's performance convention for tight kernels.
- Off-diagonal modulus `T = |WORK(K+1,1)|` uses `cmplx.absAt(Wv, idx)` (overflow-safe). Naive `sqrt(re*re + im*im)` is forbidden by the complex-numbers doc.
- Division by `T` is real division (since `T` is real), so we avoid `cmplx.div` for `AKKP1 = WORK(K+1,1)/T`: divide both real and imaginary parts by the real scalar.
- `D = T*(AK*AKP1 - 1)` is fully real because `AK`, `AKP1` come from `REAL(A(K,K))/T` (D's diagonal is real for Hermitian).
- Diagonal-of-D writes always set the imaginary part to `0.0` explicitly (vs. leaving stale data in the Complex128Array).
