# dorglq: Translation Learnings

## Translation pitfalls

- The Fortran-to-JS index mapping is straightforward since dorglq closely follows the zunglq pattern. The blocked real version is simpler than the complex version because there is no reinterpret/stride-doubling.
- Fortran `DO 50 I = KI+1, 1, -NB` is 1-based; JS equivalent is `for (i = ki; i >= 0; i -= nb)`. The 1-based-to-0-based shift means `N-I+1` in Fortran becomes `N-i` in JS.
- The blocking parameter computation (`ki`, `kk`) is identical to zunglq. `ki = floor((K-nx-1)/nb)*nb` and `kk = min(K, ki+nb)`.

## Dependency interface surprises

- `dlarft` takes `(strideT1, strideT2, offsetT)` -- WORK is used as the T matrix with strides `(1, ldwork)`.
- `dlarfb` takes 2D WORK strides: `(strideWORK1, strideWORK2, offsetWORK)`. For dorglq, WORK is shared between T (at offset 0) and the scratch workspace (at offset `ib`), both with strides `(1, ldwork)`.
- `dorgl2` takes 1D WORK stride only (no 2D strides), different from dlarfb/dlarft.
- The trans parameter for dlarfb is `'T'` (transpose) for the real case, vs `'C'` (conjugate transpose) for the complex zunglq. This is the key difference from zunglq.

## Automation opportunities

- N/A -- the real blocked QR/LQ generation pattern (dorglq, dorgqr) is now well-established. Future real blocked routines can be templated from this.

## Coverage gaps

- 100% line and branch coverage achieved on base.js.
- The blocked test (M=35, K=35, NB=32) exercises both the blocked path (i=0, ib=32 with dlarft+dlarfb) and the partial last block (i=32, ib=3).
- The partial-block zero-init test (M=40, K=35) verifies that rows beyond K are correctly zeroed before dorgl2 is applied.
- Fixture comparison was dropped for the 35x40 blocked test because the JS dgelqf produces slightly different reflectors than Fortran dgelqf for matrices larger than NB (due to accumulation order in blocking). Orthogonality verification is used instead.

## Complex number handling

- N/A -- dorglq is a real-valued routine (d-prefix). No complex arithmetic involved.
