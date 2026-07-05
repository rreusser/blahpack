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

# dsaupd

> Reverse communication interface for the Implicitly Restarted Lanczos iteration.

<section class="usage">

## Usage

```javascript
import dsaupd from '@stdlib/arpack/base/dsaupd/lib/index.js';
```

#### dsaupd( state, ido, bmat, N, which, nev, tol, resid, ncv, V, ldv, iparam, ipntr, workd, workl, lworkl, infoIn )

Top-level **reverse-communication** driver for the symmetric eigenproblem. It computes a few eigenpairs of a real symmetric operator `OP` (with respect to a symmetric positive semi-definite `B`) using the Implicitly Restarted Lanczos Method. The caller drives `dsaupd` in a loop, applying `OP` (and `B` for generalized problems) when asked, until convergence; eigenvectors are then extracted with [`dseupd`][@stdlib/arpack/base/dseupd].

```javascript
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';

var n = 10;
var A = new Float64Array( n * n );
var i;
for ( i = 0; i < n; i++ ) {
    A[ i + ( i*n ) ] = 2.0;
    if ( i < n-1 ) {
        A[ i + ( (i+1)*n ) ] = -1.0;
        A[ (i+1) + ( i*n ) ] = -1.0;
    }
}

var ncv = 6;
var ldv = n;
var V = new Float64Array( ldv * ncv );
var resid = new Float64Array( n );
for ( i = 0; i < n; i++ ) {
    resid[ i ] = 1.0 + ( 0.1 * ( i+1 ) );
}
var workd = new Float64Array( 3 * n );
var lworkl = ( ncv*ncv ) + ( 8*ncv );
var workl = new Float64Array( lworkl );
var iparam = new Int32Array( 11 );
iparam[ 0 ] = 1; // exact shifts
iparam[ 2 ] = 100; // max iterations
iparam[ 6 ] = 1; // mode 1
var ipntr = new Int32Array( 11 );
var ido = new Int32Array( 1 );
var state = {};

// info = 1 signals a user-supplied initial residual:
var info = 1;
do {
    info = dsaupd( state, ido, 'standard', n, 'LM', 3, 0.0, resid, ncv, V, ldv, iparam, ipntr, workd, workl, lworkl, info );
    if ( ido[ 0 ] === -1 || ido[ 0 ] === 1 ) {
        for ( var r = 0; r < n; r++ ) {
            var acc = 0.0;
            for ( var c = 0; c < n; c++ ) {
                acc += A[ r + ( c*n ) ] * workd[ ipntr[ 0 ] + c ];
            }
            workd[ ipntr[ 1 ] + r ] = acc;
        }
    }
} while ( ido[ 0 ] !== 99 );
// iparam[ 4 ] now holds the number of converged Ritz values.
```

### Reverse communication

The caller dispatches on `ido[ 0 ]`:

-   `-1` (or `1`): compute `Y = OP*X` (`X` at `workd[ ipntr[ 0 ] .. ]`, `Y` to `workd[ ipntr[ 1 ] .. ]`).
-   `2`: compute `Y = B*X` (generalized problem, `bmat = 'generalized'`).
-   `3`: supply `iparam[ 7 ]` shifts in `workl` at `ipntr[ 10 ]` (only when `iparam[ 0 ] = 0`; with exact shifts `iparam[ 0 ] = 1` this never occurs).
-   `99`: done.

The `state` object holds the reverse-communication state that persists across calls (create `{}` once and pass it to every call). On convergence, `iparam[ 4 ]` returns the number of converged Ritz values and `iparam[ 2 ]` the number of iterations taken; the converged Ritz values and error bounds are found in `workl` at the (1-based) pointers `ipntr[ 5 ]` and `ipntr[ 6 ]`.

The function has the following parameters:

-   **state**: persistent reverse-communication state (`{}` on first use).
-   **ido**: `Int32Array` reverse-communication flag (length-1; in/out).
-   **bmat**: `'standard'` or `'generalized'` eigenproblem.
-   **N**: order of the problem.
-   **which**: which Ritz values to compute (`'LM'`, `'SM'`, `'LA'`, `'SA'`, or `'BE'`).
-   **nev**: number of eigenvalues to compute.
-   **tol**: relative accuracy for Ritz value convergence (`<= 0` uses machine epsilon).
-   **resid**: `Float64Array` residual vector (length `N`; in/out).
-   **ncv**: number of Lanczos vectors (columns of `V`; `nev < ncv <= N`).
-   **V**: `Float64Array` Lanczos basis (`N`-by-`ncv`, column-major; out).
-   **ldv**: leading dimension of `V`.
-   **iparam**: `Int32Array` input/output parameters (length 11; in/out). `iparam[ 0 ]` = shift strategy, `iparam[ 2 ]` = max/actual iterations, `iparam[ 4 ]` = converged count (out), `iparam[ 6 ]` = mode.
-   **ipntr**: `Int32Array` workspace pointers (length 11; out).
-   **workd**: `Float64Array` reverse-communication workspace (length `>= 3*N`).
-   **workl**: `Float64Array` private workspace (length `>= ncv^2 + 8*ncv`).
-   **lworkl**: length of `workl`.
-   **infoIn**: nonzero on the first call to signal a user-supplied initial residual in `resid`.

The function returns `INFO`: `0` on success, `1` if the maximum number of iterations was reached, `3` if no shifts could be applied during a cycle, and negative on invalid input or internal failure.

#### dsaupd.ndarray( state, ido, bmat, N, which, nev, tol, resid, strideResid, offsetResid, ncv, V, strideV1, strideV2, offsetV, iparam, strideIparam, offsetIparam, ipntr, strideIpntr, offsetIpntr, workd, strideWorkd, offsetWorkd, workl, strideWorkl, offsetWorkl, lworkl, infoIn )

Drives the iteration using alternative indexing semantics (explicit strides and offsets; two matrix strides instead of a leading dimension).

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dsaupd` corresponds to the ARPACK routine `dsaupd`, translated from the reference Fortran (arpack-ng 3.9.1). It is a thin wrapper that partitions `workl` and drives `dsaup2` (the IRLM engine).
-   `ipntr` uses a mixed convention: the workd pointers `ipntr[ 0..2 ]` are 0-based offsets into `workd`, whereas the workl pointers `ipntr[ 3..6, 10 ]` are ARPACK's 1-based offsets into `workl` (which is what `dseupd` expects).

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsaupd from '@stdlib/arpack/base/dsaupd/lib/index.js';

// Compute the 3 largest eigenvalues of the 10x10 1-D Laplacian:
var n = 10;
var A = new Float64Array( n * n );
var i;
for ( i = 0; i < n; i++ ) {
    A[ i + ( i*n ) ] = 2.0;
    if ( i < n-1 ) {
        A[ i + ( (i+1)*n ) ] = -1.0;
        A[ (i+1) + ( i*n ) ] = -1.0;
    }
}

var ncv = 6;
var ldv = n;
var V = new Float64Array( ldv * ncv );
var resid = new Float64Array( n );
for ( i = 0; i < n; i++ ) {
    resid[ i ] = 1.0 + ( 0.1 * ( i+1 ) );
}
var workd = new Float64Array( 3 * n );
var lworkl = ( ncv*ncv ) + ( 8*ncv );
var workl = new Float64Array( lworkl );
var iparam = new Int32Array( 11 );
iparam[ 0 ] = 1;
iparam[ 2 ] = 100;
iparam[ 6 ] = 1;
var ipntr = new Int32Array( 11 );
var ido = new Int32Array( 1 );
var state = {};

var info = 1;
do {
    info = dsaupd( state, ido, 'standard', n, 'LM', 3, 0.0, resid, ncv, V, ldv, iparam, ipntr, workd, workl, lworkl, info );
    if ( ido[ 0 ] === -1 || ido[ 0 ] === 1 ) {
        for ( var r = 0; r < n; r++ ) {
            var acc = 0.0;
            for ( var c = 0; c < n; c++ ) {
                acc += A[ r + ( c*n ) ] * workd[ ipntr[ 0 ] + c ];
            }
            workd[ ipntr[ 1 ] + r ] = acc;
        }
    }
} while ( ido[ 0 ] !== 99 );

console.log( 'converged: %d', iparam[ 4 ] );
console.log( 'largest Ritz values:', workl[ ipntr[ 5 ]-1 ], workl[ ipntr[ 5 ] ], workl[ ipntr[ 5 ]+1 ] );
```

</section>

<!-- /.examples -->

<section class="links">

[@stdlib/arpack/base/dseupd]: https://github.com/rreusser/blahpack

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

</section>

<!-- /.links -->
