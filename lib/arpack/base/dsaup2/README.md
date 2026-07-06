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

# dsaup2

> Intermediate driver for the Implicitly Restarted Lanczos iteration (reverse communication).

<section class="usage">

## Usage

```javascript
import dsaup2 from '@stdlib/arpack/base/dsaup2/lib/index.js';
```

#### dsaup2( state, ido, bmat, N, which, nev, np, tol, resid, mode, iupd, ishift, mxiter, V, ldv, H, ldh, ritz, bounds, Q, ldq, workl, ipntr, workd, infoIn )

Drives the Implicitly Restarted Lanczos Method (IRLM): it repeatedly extends a `nev+np`-step Lanczos factorization (via `dsaitr`), computes the Ritz values and error bounds, applies `np` implicit shifts to compress the factorization back to length `nev` (via `dsapps`), and restarts until `nev` Ritz values converge. It uses **reverse communication**: the caller drives `dsaup2` in a loop, applying the operators `OP` and `B` when asked.

```javascript
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';

var N = 10;
var A = new Float64Array( N * N );
var i;
for ( i = 0; i < N; i++ ) {
    A[ i + ( i*N ) ] = 2.0;
    if ( i < N-1 ) {
        A[ i + ( (i+1)*N ) ] = -1.0;
        A[ (i+1) + ( i*N ) ] = -1.0;
    }
}

var ncv = 6;
var resid = new Float64Array( N );
for ( i = 0; i < N; i++ ) {
    resid[ i ] = 1.0 + ( 0.1 * ( i+1 ) );
}
var V = new Float64Array( N * ncv );
var H = new Float64Array( ncv * 2 );
var Q = new Float64Array( ncv * ncv );
var ritz = new Float64Array( ncv );
var bounds = new Float64Array( ncv );
var workl = new Float64Array( 3 * ncv );
var workd = new Float64Array( 3 * N );
var ipntr = new Int32Array( 3 );
var ido = new Int32Array( 1 );
var nev = new Int32Array( [ 3 ] );
var np = new Int32Array( [ 3 ] );
var mxiter = new Int32Array( [ 100 ] );
var state = {};

// info = 1 signals a user-supplied initial residual:
var info = 1;
do {
    info = dsaup2( state, ido, 'standard', N, 'LM', nev, np, 0.0, resid, 1, 1, 1, mxiter, V, N, H, ncv, ritz, bounds, Q, ncv, workl, ipntr, workd, info );
    if ( ido[ 0 ] === -1 || ido[ 0 ] === 1 ) {
        for ( var r = 0; r < N; r++ ) {
            var acc = 0.0;
            for ( var c = 0; c < N; c++ ) {
                acc += A[ r + ( c*N ) ] * workd[ ipntr[ 0 ] + c ];
            }
            workd[ ipntr[ 1 ] + r ] = acc;
        }
    }
} while ( ido[ 0 ] !== 99 );
// ritz(0:np[0]-1) now holds the converged Ritz values.
```

### Reverse communication

The caller dispatches on `ido[ 0 ]`:

-   `-1` (or `1`): compute `Y = OP*X` (`X` at `workd[ ipntr[ 0 ] .. ]`, `Y` to `workd[ ipntr[ 1 ] .. ]`).
-   `2`: compute `Y = B*X` (generalized problem, `bmat = 'generalized'`).
-   `3`: the caller must supply `np[ 0 ]` shifts in `workl(0 .. np[0]-1)` (only when `ishift = 0`; with `ishift = 1` the shifts are computed internally and this `ido` never appears).
-   `99`: done.

The `state` object holds the reverse-communication state that persists across calls (create `{}` once and pass it to every call). On convergence, `np[ 0 ]` returns the number of converged Ritz values `nconv`, `mxiter[ 0 ]` the number of iterations taken, and `ritz`/`bounds` the converged Ritz values and their error bounds; the caller then extracts eigenvectors via `dseupd`.

The function has the following parameters:

-   **state**: persistent reverse-communication state (`{}` on first use).
-   **ido**: `Int32Array` reverse-communication flag (length-1; in/out).
-   **bmat**: `'standard'` or `'generalized'` eigenproblem.
-   **N**: order of the problem.
-   **which**: which Ritz values to compute (`'LM'`, `'SM'`, `'LA'`, `'SA'`, or `'BE'`).
-   **nev**: `Int32Array` number of eigenvalues to compute (length-1; in/out).
-   **np**: `Int32Array` number of implicit shifts, returns `nconv` on exit (length-1; in/out).
-   **tol**: relative accuracy for Ritz value convergence (`<= 0` uses machine epsilon).
-   **resid**: `Float64Array` residual vector (length `N`; in/out).
-   **mode**: problem mode (from `iparam[6]`).
-   **iupd**: restart flag (`1` to restart on convergence failure).
-   **ishift**: `0` for user-supplied shifts (reverse communication), `1` for exact shifts.
-   **mxiter**: `Int32Array` max iterations (in) / actual iterations (out) (length-1; in/out).
-   **V**: `Float64Array` Lanczos basis (`N`-by-`ncv`, column-major, `ncv = nev+np`).
-   **ldv**: leading dimension of `V`.
-   **H**: `Float64Array` tridiagonal matrix (2-column layout).
-   **ldh**: leading dimension of `H`.
-   **ritz**: `Float64Array` Ritz values (length `ncv`; out).
-   **bounds**: `Float64Array` Ritz estimates (length `ncv`; out).
-   **Q**: `Float64Array` rotation accumulation matrix (`ncv`-by-`ncv`, column-major).
-   **ldq**: leading dimension of `Q`.
-   **workl**: `Float64Array` workspace (length `>= 3*ncv`).
-   **ipntr**: `Int32Array` operator pointers into `workd` (0-based; out).
-   **workd**: `Float64Array` reverse-communication workspace (length `>= 3*N`).
-   **infoIn**: nonzero on the first call to signal a user-supplied initial residual in `resid`.

The function returns `INFO`: `0` on success, `1` if the maximum number of iterations was reached before convergence, and negative on invalid input or internal failure.

#### dsaup2.ndarray( state, ido, bmat, N, which, nev, np, tol, resid, strideResid, offsetResid, mode, iupd, ishift, mxiter, V, strideV1, strideV2, offsetV, H, strideH1, strideH2, offsetH, ritz, strideRitz, offsetRitz, bounds, strideBounds, offsetBounds, Q, strideQ1, strideQ2, offsetQ, workl, strideWorkl, offsetWorkl, ipntr, strideIpntr, offsetIpntr, workd, strideWorkd, offsetWorkd, infoIn )

Drives the iteration using alternative indexing semantics (explicit strides and offsets; two matrix strides instead of leading dimensions).

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dsaup2` corresponds to the ARPACK routine `dsaup2`, translated from the reference Fortran (arpack-ng 3.9.1). It is the workhorse invoked by `dsaupd`; most callers should use `dsaupd` (and `dseupd`) rather than this routine directly.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsaup2 from '@stdlib/arpack/base/dsaup2/lib/index.js';

// Compute the 3 largest eigenvalues of the 10x10 1-D Laplacian:
var N = 10;
var A = new Float64Array( N * N );
var i;
for ( i = 0; i < N; i++ ) {
    A[ i + ( i*N ) ] = 2.0;
    if ( i < N-1 ) {
        A[ i + ( (i+1)*N ) ] = -1.0;
        A[ (i+1) + ( i*N ) ] = -1.0;
    }
}

var ncv = 6;
var resid = new Float64Array( N );
for ( i = 0; i < N; i++ ) {
    resid[ i ] = 1.0 + ( 0.1 * ( i+1 ) );
}
var V = new Float64Array( N * ncv );
var H = new Float64Array( ncv * 2 );
var Q = new Float64Array( ncv * ncv );
var ritz = new Float64Array( ncv );
var bounds = new Float64Array( ncv );
var workl = new Float64Array( 3 * ncv );
var workd = new Float64Array( 3 * N );
var ipntr = new Int32Array( 3 );
var ido = new Int32Array( 1 );
var nev = new Int32Array( [ 3 ] );
var np = new Int32Array( [ 3 ] );
var mxiter = new Int32Array( [ 100 ] );
var state = {};

var info = 1;
do {
    info = dsaup2( state, ido, 'standard', N, 'LM', nev, np, 0.0, resid, 1, 1, 1, mxiter, V, N, H, ncv, ritz, bounds, Q, ncv, workl, ipntr, workd, info );
    if ( ido[ 0 ] === -1 || ido[ 0 ] === 1 ) {
        for ( var r = 0; r < N; r++ ) {
            var acc = 0.0;
            for ( var c = 0; c < N; c++ ) {
                acc += A[ r + ( c*N ) ] * workd[ ipntr[ 0 ] + c ];
            }
            workd[ ipntr[ 1 ] + r ] = acc;
        }
    }
} while ( ido[ 0 ] !== 99 );

console.log( 'converged: %d', np[ 0 ] );
console.log( 'largest Ritz values:', ritz[ 0 ], ritz[ 1 ], ritz[ 2 ] );
```

</section>

<!-- /.examples -->

<section class="links">

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

</section>

<!-- /.links -->
