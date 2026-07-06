<!--

@license Apache-2.0

Copyright (c) 2025 The Stdlib Authors.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

-->

# dsband

> Compute a few eigenpairs of a banded symmetric eigenproblem via the Implicitly Restarted Lanczos method.

<section class="usage">

## Usage

```javascript
import dsband from '@stdlib/arpack/base/dsband/lib/index.js';
```

#### dsband( rvec, howmny, select, d, Z, ldz, sigma, N, AB, MB, lda, RFAC, kl, ku, which, bmat, nev, tol, resid, ncv, V, ldv, iparam, workd, workl, lworkl, iwork, infoIn )

Computes converged approximations to the eigenvalues of `A*z = lambda*B*z`, where `A` and `B` are symmetric matrices stored in LAPACK band form, and optionally the corresponding eigenvectors. Unlike the lower-level ARPACK routines, `dsband` is a **self-contained driver**: it runs the entire `dsaupd`/`dseupd` reverse-communication loop internally (applying the banded operators via `dgbtrf`, `dgbtrs`, and `dgbmv`) and returns once the iteration converges.

The problem `mode` is selected via `iparam[6]`:

-   `1`: regular mode, `OP = A`, `B = I` (standard).
-   `2`: regular inverse mode, `OP = inv[M]*A`, `B = M` (generalized).
-   `3`: shift-invert mode, `OP = inv[A-sigma*M]*M`, `B = M` (or `inv[A-sigma*I]` when `bmat = 'standard'`).
-   `4`: buckling mode.
-   `5`: Cayley mode.

```javascript
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';

// K x = lambda M x for a 1-D FEM Laplacian K and consistent mass M (kl = ku = 1):
var n = 20;
var nev = 4;
var ncv = 10;
var lda = 4; // 2*kl + ku + 1
var kl = 1;
var ku = 1;
var idiag = kl + ku + 1;
var isup = kl + ku;
var isub = kl + ku + 2;

var AB = new Float64Array( lda * n );
var MB = new Float64Array( lda * n );
var h = 1.0 / ( n+1 );
var j;
for ( j = 1; j <= n; j++ ) {
    AB[ ( idiag-1 ) + ( (j-1)*lda ) ] = 2.0 / h;
    MB[ ( idiag-1 ) + ( (j-1)*lda ) ] = ( 4.0/6.0 ) * h;
}
for ( j = 1; j <= n-1; j++ ) {
    AB[ ( isup-1 ) + ( j*lda ) ] = -1.0 / h;
    AB[ ( isub-1 ) + ( (j-1)*lda ) ] = -1.0 / h;
    MB[ ( isup-1 ) + ( j*lda ) ] = ( 1.0/6.0 ) * h;
    MB[ ( isub-1 ) + ( (j-1)*lda ) ] = ( 1.0/6.0 ) * h;
}

var RFAC = new Float64Array( lda * n );
var V = new Float64Array( n * ncv );
var d = new Float64Array( ncv );
var resid = new Float64Array( n );
var i;
for ( i = 0; i < n; i++ ) {
    resid[ i ] = 1.0 + ( 0.1 * ( i+1 ) );
}
var workd = new Float64Array( 3 * n );
var lworkl = ( ncv*ncv ) + ( 8*ncv );
var workl = new Float64Array( lworkl );
var iparam = new Int32Array( 11 );
iparam[ 2 ] = 300; // max iterations
iparam[ 6 ] = 3; // shift-invert mode
var iwork = new Int32Array( n );
var select = new Int32Array( ncv );

// which = 'LM' with sigma = 0 targets the smallest generalized eigenvalues:
var info = dsband( true, 'all', select, d, V, n, 0.0, n, AB, MB, lda, RFAC, kl, ku, 'LM', 'generalized', nev, 0.0, resid, ncv, V, n, iparam, workd, workl, lworkl, iwork, 1 );
// d[ 0 .. iparam[4]-1 ] now holds the converged eigenvalues in ascending order.
```

The function has the following parameters:

-   **rvec**: whether to compute Ritz vectors.
-   **howmny**: `'all'` or `'select'` (only `'all'` is implemented).
-   **select**: `Int32Array` selection array (length `ncv`).
-   **d**: `Float64Array` Ritz values (length `nev`; out).
-   **Z**: `Float64Array` Ritz vectors (`N`-by-`nev`, column-major; out). May alias `V`.
-   **ldz**: leading dimension of `Z`.
-   **sigma**: the shift (modes 3, 4, 5).
-   **N**: order of the problem.
-   **AB**: `Float64Array` matrix `A` in LAPACK band storage (leading dimension `lda`).
-   **MB**: `Float64Array` matrix `M` in LAPACK band storage (leading dimension `lda`).
-   **lda**: leading dimension of `AB`, `MB`, and `RFAC` (`>= 2*kl + ku + 1`).
-   **RFAC**: `Float64Array` band LU workspace/output.
-   **kl**: number of subdiagonals.
-   **ku**: number of superdiagonals.
-   **which**: which eigenvalues to compute (`'LM'`, `'SM'`, `'LA'`, `'SA'`, or `'BE'`).
-   **bmat**: `'standard'` or `'generalized'` eigenproblem.
-   **nev**: number of eigenvalues to compute.
-   **tol**: relative accuracy for Ritz value convergence (`<= 0` uses machine epsilon).
-   **resid**: `Float64Array` residual vector (length `N`; in/out).
-   **ncv**: number of Lanczos vectors (`nev < ncv <= N`).
-   **V**: `Float64Array` Lanczos basis (`N`-by-`ncv`, column-major; out).
-   **ldv**: leading dimension of `V`.
-   **iparam**: `Int32Array` input/output parameters (length 11; in/out). `iparam[2]` = max/actual iterations, `iparam[4]` = converged count (out), `iparam[6]` = mode.
-   **workd**: `Float64Array` reverse-communication workspace (length `>= 3*N`).
-   **workl**: `Float64Array` private workspace (length `>= ncv^2 + 8*ncv`).
-   **lworkl**: length of `workl`.
-   **iwork**: `Int32Array` integer pivot workspace (length `>= N`).
-   **infoIn**: nonzero to signal a user-supplied initial residual in `resid`.

The function returns `INFO`: `0` on success, `1` if the maximum number of iterations was reached, and negative on invalid input or internal failure.

#### dsband.ndarray( rvec, howmny, select, strideSelect, offsetSelect, d, strideD, offsetD, Z, strideZ1, strideZ2, offsetZ, sigma, N, AB, strideAB1, strideAB2, offsetAB, MB, strideMB1, strideMB2, offsetMB, RFAC, strideRFAC1, strideRFAC2, offsetRFAC, kl, ku, which, bmat, nev, tol, resid, strideResid, offsetResid, ncv, V, strideV1, strideV2, offsetV, iparam, strideIparam, offsetIparam, workd, strideWorkd, offsetWorkd, workl, strideWorkl, offsetWorkl, lworkl, iwork, strideIwork, offsetIwork, infoIn )

Solves the banded eigenproblem using alternative indexing semantics (explicit strides and offsets; two matrix strides instead of leading dimensions).

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dsband` corresponds to the ARPACK routine `dsband` from `EXAMPLES/BAND` (arpack-ng 3.9.1). It drives `dsaupd` and `dseupd` and applies the operators through the LAPACK band routines `dgbtrf`/`dgbtrs` and BLAS `dgbmv`.
-   Only `howmny = 'all'` is implemented, matching the reference.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsband from '@stdlib/arpack/base/dsband/lib/index.js';

// Compute the 4 smallest eigenvalues of the 1-D FEM generalized problem
// K x = lambda M x (K Laplacian, M consistent mass), stored in band form:
var n = 50;
var nev = 4;
var ncv = 10;
var lda = 4;
var kl = 1;
var ku = 1;
var idiag = kl + ku + 1;
var isup = kl + ku;
var isub = kl + ku + 2;

var AB = new Float64Array( lda * n );
var MB = new Float64Array( lda * n );
var h = 1.0 / ( n+1 );
var j;
for ( j = 1; j <= n; j++ ) {
    AB[ ( idiag-1 ) + ( (j-1)*lda ) ] = 2.0 / h;
    MB[ ( idiag-1 ) + ( (j-1)*lda ) ] = ( 4.0/6.0 ) * h;
}
for ( j = 1; j <= n-1; j++ ) {
    AB[ ( isup-1 ) + ( j*lda ) ] = -1.0 / h;
    AB[ ( isub-1 ) + ( (j-1)*lda ) ] = -1.0 / h;
    MB[ ( isup-1 ) + ( j*lda ) ] = ( 1.0/6.0 ) * h;
    MB[ ( isub-1 ) + ( (j-1)*lda ) ] = ( 1.0/6.0 ) * h;
}

var RFAC = new Float64Array( lda * n );
var V = new Float64Array( n * ncv );
var d = new Float64Array( ncv );
var resid = new Float64Array( n );
var i;
for ( i = 0; i < n; i++ ) {
    resid[ i ] = 1.0 + ( 0.1 * ( i+1 ) );
}
var workd = new Float64Array( 3 * n );
var lworkl = ( ncv*ncv ) + ( 8*ncv );
var workl = new Float64Array( lworkl );
var iparam = new Int32Array( 11 );
iparam[ 2 ] = 300;
iparam[ 6 ] = 3;
var iwork = new Int32Array( n );
var select = new Int32Array( ncv );

var info = dsband( true, 'all', select, d, V, n, 0.0, n, AB, MB, lda, RFAC, kl, ku, 'LM', 'generalized', nev, 0.0, resid, ncv, V, n, iparam, workd, workl, lworkl, iwork, 1 );

console.log( 'info: %d, converged: %d', info, iparam[ 4 ] );
console.log( 'smallest eigenvalues:', Array.prototype.slice.call( d, 0, nev ) );
```

</section>

<!-- /.examples -->

<section class="links">

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

</section>

<!-- /.links -->
