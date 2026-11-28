# zhemm: Translation Learnings

## Translation pitfalls

- Both alpha and beta are COMPLEX*16 in zhemm (unlike zher2k where beta is real). Must extract real/imag parts from both.
- Diagonal of A is real: use `Av[ia]` only (not `Av[ia+1]`) where the Fortran uses `DBLE(A(I,I))`.
- In the left-side case, off-diagonal access uses `DCONJG(A(K,I))` not just `A(K,I)` -- this means conjugate multiplication for temp2 accumulation.
- The right-side case is structurally different from left-side: outer loop is over j, inner k splits into k<j and k>j, with conjugation logic depending on upper/lower.

## Dependency interface surprises

- N/A -- zhemm is a leaf BLAS routine with no dependencies beyond reinterpret.

## Automation opportunities

- The dsymm-to-zhemm translation is mechanical: add reinterpret pattern, split real/imag ops, add conjugation for off-diagonal access, treat diagonal as real. Could be automated for future symmetric-to-Hermitian conversions.

## Coverage gaps

- Lines 130-137 (right-side, beta!=0 inner loop for k>j, lower case) and lines 239-243, 267-278 (right-side, k>j upper/lower branches) not covered. These are the less common right-side operation paths. 86.84% branch coverage met the target.

## Complex number handling

- All complex multiplication inlined (safe): alpha*B[i,j], alpha*conj(A[k,i]), beta*C[i,j].
- No complex division or absolute value needed -- no cmplx.div/cmplx.abs calls required.
- Conjugation for off-diagonal Hermitian elements is a sign flip on the imaginary part in the multiplication formula.
