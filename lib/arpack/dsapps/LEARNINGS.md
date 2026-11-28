# dsapps: Translation Learnings

## Translation pitfalls

-   `bin/fortran_body.py` dropped the `c = -c` line from the `if (r .lt. zero)`
    block inside the bulge-chase loop (loop 70). The real `dsapps.f` negates all
    three of `r`, `c`, and `s` there; the stripped body only showed `r` and `s`.
    Always cross-check the stripped body against the raw `.f` source for the
    sign-normalization branches — dropping `c = -c` would silently corrupt every
    subsequent rotation and `Q`.

-   `H` uses the ARPACK 2-column layout: `h(*,1)` is the subdiagonal (meaningful
    in rows 2..kev+np, with `h(1,1)` unused) and `h(*,2)` is the main diagonal.
    Subdiagonals are assumed non-negative on input and are enforced non-negative
    on output; the two `if (h(...,1) .lt. zero)` / `if (r .lt. zero)` branches are
    what maintain that invariant and must be translated exactly.

-   The routine is not reverse-communication and returns nothing (void); it
    mutates `v`, `h`, and `resid` in place. Its only `SAVE` state is a one-time
    `epsmch = dlamch('Epsilon-Machine')`, translated as a plain
    `dlamch('epsilon')` computed each call — no cross-call state.

-   The nested Fortran `go to` structure (label 20 retry for the next split
    block, `go to 40` deflation break, `go to 90` per-shift break) maps cleanly
    onto a `for (;;)` inner loop with `continue`/`break` plus a plain `break` in
    the itop-advance loop. `istart = iend + 1` is recomputed before each retry,
    so the `for (;;)` must re-scan from the updated `istart`.

-   `q(j,istart+1)` is updated using the OLD `q(j,istart)` before `q(j,istart)`
    itself is overwritten (the Fortran writes `q(j,istart)` last). Because the
    temporary `a1` and the `q(j,istart+1)` update both read the old value before
    the final store, a direct element-by-element translation preserves this.

## Dependency interface surprises

-   `dgemv` expects the trans flag as the string `'no-transpose'` (not `'N'`).

-   `dlaset`'s `uplo` treats anything other than `'upper'`/`'lower'` as the full
    matrix, so the Fortran `'All'` maps to any non-upper/non-lower string (`'all'`).

-   `dlartg( f, g, out )` writes a length-3 output array `out = [ c, s, r ]`
    rather than returning `c`, `s`, `r` as separate out-parameters. Allocate a
    reusable 3-element scratch array and read `rot[0]`, `rot[1]`, `rot[2]`.

## Fixture / verification notes

-   Inputs were built from exact binary fractions (`0.25*i - 0.125*j + 0.5` for
    `v`, `0.5*i - 1.25` for `resid`, and diagonals/subdiagonals of halves and
    quarters) so the Fortran driver and the JS reconstruction agree bit-for-bit.
    Verified sign-for-sign against the Fortran fixture with max abs diff
    ~4.4e-15 across `v`, `h`, `resid`, and `q` for four cases (a plain bulge
    chase, a zero-subdiagonal deflation case, a wide `np > kev` case, and a
    single-shift case).
