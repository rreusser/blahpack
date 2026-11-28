# zsytrf_aa: Translation Learnings

## Translation pitfalls

- **Mostly mechanical d → z port from `dsytrf_aa`.** All BLAS calls map
  one-to-one (dswap → zswap, dcopy → zcopy, dgemm → zgemm, dgemv → zgemv,
  dscal → zscal). The only structural changes are: A becomes
  `Complex128Array`; the `ALPHA` Fortran COMPLEX*16 scalar becomes a
  `Complex128` JS object (constructed once per panel); and direct
  `A[ idx ]` reads/writes need a `reinterpret()` Float64 view (`av`).
- **Aasen IPIV is plain integer, NOT Bunch-Kaufman bitwise-NOT.** Same
  warning as in `dsytrf_aa` — do not apply `~` decoding. IPIV stores
  0-based row indices directly. The skill's "Index Convention Landmines"
  table now documents the Aasen exception explicitly; trust it.
- **`zscal` takes a `Complex128` scalar, not a real.** Unlike `zdscal`
  (which takes a real). The trailing-update merge step constructs
  `alpha = new Complex128( alphaR, alphaI )` once per panel and passes it
  to `zscal`. Allocating one Complex128 per outer iteration is
  acceptable; this is not a hot loop.
- **`oA = offsetA * 2`, `sa1 = strideA1 * 2`, `sa2 = strideA2 * 2` only
  for the direct `av[ ... ]` index calculations.** Pass the original
  `strideA1`/`strideA2`/`offsetA` to BLAS callees — they all use
  complex-element strides and do their own `*2` internally.

## Dependency interface surprises

- **zlasyf_aa signature mirrors dlasyf_aa.** Same parameter order:
  `(uplo, j1, M, nb, A, sa1, sa2, oA, IPIV, sIP, oIP, H, sH1, sH2, oH,
  WORK, sW, oW)`. The driver passes `H` at `WORK[0..N*NB-1]` with
  `strideH1=1, strideH2=N`, and the per-panel scratch `WORK` at
  `WORK[N*NB..]`. Same caller-initialized H(:,0) requirement (handled by
  the top-of-routine and end-of-iteration `zcopy`).
- **`zgemm`/`zgemv` accept `'transpose'` (not `'conjugate-transpose'`).**
  Symmetric (not Hermitian), so we use plain transpose throughout. Don't
  reflexively swap to conjugate-transpose just because we're complex.

## Complex number handling

- **Save `alphaR`/`alphaI` to locals once per panel** so we can both
  pass `alpha` to `zscal` (as a Complex128) AND restore the slot
  afterward by writing back to the Float64 view. Constructing a new
  Complex128 to recover T(J,J+1) would also work but the local is
  cheaper.
- **Mirror reads use plain `A[k,i]` — NO conjugation.** Symmetric
  variant; the reference Fortran does no conjugate; we do not invent
  one. (Don't confuse with `zhetrf_aa` if it ever exists, which would.)
- **No inlined complex division/abs** in the driver itself; all
  numerically tricky arithmetic is delegated to `zlasyf_aa`. The driver
  only does `*ONE` / `*NEGONE` BLAS calls and a single Complex128 read
  per panel.

## Fortran test infrastructure

- **`run_fortran.sh` `Lines: N` reading is unreliable when stdout is
  large.** With 12 test cases including two 70x70 fixtures (~9800
  doubles each), the script reported `Lines: 1` or `Lines: 2` while the
  binary actually wrote 12 newline-terminated lines. Direct invocation
  of the binary into a redirected file produced the correct fixture.
  Treat the script's tail-line count as advisory; verify with
  `wc -l <fixture>` or `python -c "json each line"` before doubting.
- **`gfortran` complex equivalence stride caveat.** For each test case
  with N = LDA, declare `complex*16 :: aN(N,N)` and
  `double precision :: aN_r(2*N*N)` so the EQUIVALENCE has zero padding.
  Trying to share one large buffer across cases with mismatched LDAs
  silently reads padding bytes (see SKILL.md "Leading dimension vs
  EQUIVALENCE stride mismatch").

## Coverage

- **100% line / 100% branch on base.js** with the full fixture matrix.
- The trailing-update `J1 > 1` branch (lower line 279 / upper lines
  183-184) only fires from the **third** panel onward. With NB=32, this
  required adding 70x70 fixtures (3 panels: 32, 32, 6). The 40x40 case
  has only one trailing update (j_post=32, second panel j_pre=32 has
  J1=33 but no further trailing update after it because j becomes 40).
- The base-only `if (N === 0) return 0` short-circuit is shadowed by
  the wrapper's identical guard. A single `test.js` test that calls
  `base()` directly with N=0 covers it.

## Lint codemods

- **`bin/lint-fix.sh`'s vars-on-top codemod can shuffle declarations
  past their first use.** It moved `var view = reinterpret( arr, 0 );`
  ABOVE `var arr = new Complex128Array(...);`. Manually reorder after
  any `lint-fix` run if a function had an inline initializer that
  depended on a local. This was previously documented in the
  `dsytrf_aa` learnings; consider auto-detecting use-before-define
  in the codemod.
- **The two-statements-per-line `view[a]=x; view[b]=y;` pattern was
  rejected en masse** by `max-statements-per-line`. A simple python
  regex split (`/^(\s*)(view\[..]=..);\s+(view\[..]=..);$/`) handles
  it cleanly. Worth extracting as a `bin/codemod-tests.js` rule.
