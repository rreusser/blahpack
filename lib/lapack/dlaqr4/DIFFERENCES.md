# dlaqr4: differences from the reference

## [REFERENCE] WORK minimum

The reference documents `LWORK >= max(1,N)` but neither checks it nor needs it:
it caps the aggressive-early-deflation window at `NW <= LWORK/2` and the shift
count at `NS <= 2*LWORK/3`, and DLAQR2 and DLAQR5 adapt to the `WORK` they are
given, so for any `LWORK >= 1` it does not write past `WORK(LWORK)`
(compiled LAPACK 3.12.0 on random and cyclic-shift Hessenberg matrices). `ndarray.js`
therefore demands the effective minimum, 1, for `N > 0`, not the documented `max(1,N)`; at `N = 0` it demands nothing (an empty problem needs no workspace, CONVENTIONS W3), where the reference writes `WORK(1)`.

With so little room the reference's QR iteration takes another path: at
`LWORK` = 1 or 2 (no window and no shifts) it makes no progress and returns
`INFO > 0`, and the JS does the same (compiled LAPACK 3.12.0 and the JS agree
on `INFO` at `LWORK` = 1 to 4 for `N` = 120 to 300). The layout wrapper's `null`
allocation is still the reference's optimum.
