# zhsein: Translation Learnings

## Translation pitfalls

- Fortran `DO 20 I = K, KL+1, -1` falling through without hitting the
  `GOTO 30` leaves the loop variable at `KL` (one past the lower bound),
  and `KL = I` is then a no-op. Preserved this by using a `while` loop
  whose variable lands at `kl` after a clean fall-through.
- The analogous `DO 40 I = K, N-1` (right-side block extension) has the
  loop variable land at `N` (1-based, i.e. `N-1` 0-based) on
  fall-through, and `KR = I` must therefore become `kr = N-1`.
- Bookkeeping is kept fully 0-indexed: `kl`, `kr` are 0-based inclusive
  endpoints, `ks` is the 0-based destination column in `VL`/`VR`, and
  `IFAILL[ks] = k + 1` restores the 1-based index the LAPACK API
  reports on failure.
- The wrapper is the only place the `M` counter (number of selected
  eigenvalues) is computed; we return it on the result object rather
  than mutating a positional `M` parameter, matching the
  `dtrsna`/`dlaqtr` pattern.

## Dependency interface surprises

- `zlaein` takes a complex workspace matrix `B` with its own
  `strideB1`/`strideB2`/`offsetB` — not a flat `WORK(LDWORK)` as in
  Fortran. We pass the caller's `WORK` (a `Complex128Array` of length
  `N*N`) as `B`, with strides `1, N, 0`, which reproduces the
  column-major `LDWORK=N` layout Fortran expects.
- `zlanhs` uses long-form norm strings (`'inf-norm'`, not `'I'`) and
  expects a `Float64Array` RWORK workspace.
- `dlamch` uses long-form parameter strings (`'safe-minimum'`,
  `'precision'`).

## Complex number handling

- `CABS1(W(I) - WK) < EPS3` is a cheap `|re| + |im|` distance; inlined
  as `Math.abs(wiR - wkR) + Math.abs(wiI - wkI)` since it is purely
  component-wise subtraction followed by the 1-norm — no division,
  no square root, no hidden numerical hazard.
- `WK` is passed to `zlaein` as a `Complex128` scalar (the subroutine
  wants an object, not components), so we construct a fresh
  `new Complex128(wkR, wkI)` after each perturbation loop. This is
  outside the hot loop so the allocation is fine.
- All zeroing of `VL` rows above `kl` and `VR` rows below `kr` is done
  directly on the reinterpret views, writing both real and imaginary
  components to `0.0`.

## Fortran test build

- Adding `la_constants` and `la_xisnan` (the `.f90`/`.F90` module
  files) to `deps_zhsein.txt` is required for `zlassq` (transitively
  reached via `zlanhs`) to link. These modules must precede `zlassq`
  in the link order — our `run_fortran.sh` walks the deps file
  top-to-bottom, so listing `la_constants`/`la_xisnan` first solves
  the `__la_xisnan_MOD_disnan` undefined reference.
