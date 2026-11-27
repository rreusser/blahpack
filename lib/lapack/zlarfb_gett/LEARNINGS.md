# zlarfb_gett: Translation Learnings

## Translation pitfalls

- The Fortran quick-return condition is `M < 0 .OR. N <= 0 .OR. K == 0 .OR. K > N`. Note `N <= 0` (strict), not `N < 0` — so `N = 0` is a quick return.
- `V1` is unit lower-triangular when `IDENT != 'I'`. In the ztrmm calls you must pass `diag = 'unit'` (not `'non-unit'`) — the unit diagonal is implicit in `A` (ones are not stored).
- The routine uses uplo `'lower'` for V1 (despite A being upper-trapezoidal): the strict lower triangle of `A(1:K,1:K)` holds V1, so ztrmm must reference the lower triangle with `diag='unit'`.
- col1_(1) copies only the upper-triangular part of A1 column-by-column (zcopy length is `J`, the column index), then zeros the subdiagonal of W1 explicitly.

## Dependency interface surprises

- ztrmm, zgemm, zcopy accept `Complex128Array` directly with strides in complex-element units — NO reinterpret is required at the parent level when merely forwarding the arrays. Only the direct element-by-element A -= W subtractions inside this routine need `reinterpret` and stride*2 indexing.
- zcopy signature: `(N, zx, strideX, offsetX, zy, strideY, offsetY)` — complex-element strides and offsets.

## Complex number handling

- Use module-scope `ONE = new Complex128(1,0)` and `NEGONE = new Complex128(-1,0)`. No ZERO is needed (unlike ztprfb) because the beta=0 case is not exercised.
- The element-by-element `A - W` and `A = -W` updates are real additions/subtractions on the reinterpreted Float64 view — no cmplx.div or cmplx.abs required.

## Test construction

- Declare Fortran test arrays to EXACTLY match the leading dimensions used (`T(K,K)`, `A(K,N)`, `B(M,N)`), not oversized NMAX arrays — this avoids the EQUIVALENCE-stride trap where `print_array(2*K*N)` reads padding from beyond the used submatrix.
- Fixture tests use JS-side `makeT/makeA/makeB` helpers that mirror the Fortran `fill_*` subroutines exactly, so a single fixture file can be checked against any constructed input.

## Scaffold issues encountered

- The init scaffold generates `@param {Float64Array}` for all matrix args; must be manually changed to `Complex128Array` in base.js, ndarray.js, and `zlarfb_gett.js`.
- The scaffold's benchmark.js uses the wrong signature (13 args, `'row-major'`, all-`N`) — replace with a valid call using `Complex128Array` and correct parameters.
- Scaffold's examples/index.js has a `TODO: Adjust call to match...` comment and wrong-shape call — replace entirely.
- For underscore-named routines, `camelcase` must be added to the file-level eslint-disable in base.js, ndarray.js, zlarfb_gett.js, main.js, index.js, test files, benchmark files.
- Scaffold's zlarfb_gett.js (layout wrapper) doesn't validate the `ident` string — must be added manually to both the layout wrapper and `ndarray.js`.

## Process improvements

- Run `bin/lint-fix.sh` after writing each file; the auto-fix handles vars-order automatically and saves time.
- The `stdlib/signature-conformance` rule emits a warning when the signature has 20 params (adding WORK strides/offset) — this is a known false positive for routines with a WORK matrix and is harmless.
