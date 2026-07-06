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

# dsaitr

> Extend a symmetric Lanczos factorization by `np` steps (reverse communication).

<section class="usage">

## Usage

```javascript
import dsaitr from '@stdlib/arpack/base/dsaitr/lib/index.js';
```

#### dsaitr( state, ido, bmat, N, k, np, mode, resid, rnorm, V, ldv, H, ldh, ipntr, workd )

Extends the symmetric Lanczos factorization `OP*V_k = V_k*H_k + f_k*e_k^T` from length `k` to length `k+np`, using **reverse communication**: the caller drives `dsaitr` in a loop, applying the operators `OP` and `B` when asked.

```javascript
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';

var N = 4;
var A = new Float64Array( [ 2.0, -1.0, 0.0, 0.0, -1.0, 2.0, -1.0, 0.0, 0.0, -1.0, 2.0, -1.0, 0.0, 0.0, -1.0, 2.0 ] );
var np = 2;
var resid = new Float64Array( [ 1.0, 0.4, -0.3, 0.7 ] );

var s = 0.0;
var i;
for ( i = 0; i < N; i++ ) {
    s += resid[ i ] * resid[ i ];
}
var rnorm = new Float64Array( [ Math.sqrt( s ) ] );

var V = new Float64Array( N * np );
var H = new Float64Array( np * 2 );
var workd = new Float64Array( 3 * N );
var ipntr = new Int32Array( 3 );
var ido = new Int32Array( 1 );
var state = {};

// Loop invariant: workd(0:N-1) holds B*resid (B = I here):
for ( i = 0; i < N; i++ ) {
    workd[ i ] = resid[ i ];
}

var info = 0;
do {
    info = dsaitr( state, ido, 'standard', N, 0, np, 1, resid, rnorm, V, N, H, np, ipntr, workd );
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
```

### Reverse communication

The caller dispatches on `ido[ 0 ]`:

-   `0` on the first call; on entry, `resid` must hold the initial residual and `rnorm[ 0 ]` its `B`-norm, and `workd(0:N-1)` must hold `B*resid`.
-   `-1` (or `1`): compute `Y = OP*X` (`X` at `workd[ ipntr[ 0 ] .. ]`, `Y` to `workd[ ipntr[ 1 ] .. ]`).
-   `2`: compute `Y = B*X` (generalized problem, `bmat = 'generalized'`).
-   `99`: done.

The `state` object holds the reverse-communication state that persists across calls (create `{}` once and pass it to every call). On exit, the first `k+np` columns of `V` hold the Lanczos basis and `H` (2-column layout: subdiagonal in column 0, diagonal in column 1) holds the tridiagonal projection.

The function has the following parameters:

-   **state**: persistent reverse-communication state (`{}` on first use).
-   **ido**: `Int32Array` reverse-communication flag (length-1; in/out).
-   **bmat**: `'standard'` or `'generalized'` eigenproblem.
-   **N**: order of the problem.
-   **k**: current order of the factorization.
-   **np**: number of additional steps.
-   **mode**: problem mode (from `iparam[6]`; `2` is the `B*OP = A` shortcut).
-   **resid**: `Float64Array` residual vector (length `N`; in/out).
-   **rnorm**: `Float64Array` B-norm of the residual (length-1; in/out).
-   **V**: `Float64Array` Lanczos basis (`N`-by-`(k+np)`, column-major).
-   **ldv**: leading dimension of `V`.
-   **H**: `Float64Array` tridiagonal matrix (2-column layout).
-   **ldh**: leading dimension of `H`.
-   **ipntr**: `Int32Array` operator pointers into `workd` (0-based; out).
-   **workd**: `Float64Array` reverse-communication workspace (length `>= 3*N`).

The function returns `INFO`: `0` on success, or the size of the converged invariant subspace if a restart failed.

#### dsaitr.ndarray( state, ido, bmat, N, k, np, mode, resid, strideResid, offsetResid, rnorm, V, strideV1, strideV2, offsetV, H, strideH1, strideH2, offsetH, ipntr, strideIpntr, offsetIpntr, workd, strideWorkd, offsetWorkd )

Extends the factorization using alternative indexing semantics (explicit strides and offsets; two matrix strides instead of leading dimensions).

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dsaitr` corresponds to the ARPACK routine `dsaitr`, translated from the reference Fortran (arpack-ng 3.9.1). When the iteration hits an invariant subspace it restarts by generating a random vector via `dgetv0`; that restart path is translated faithfully but is exercised end-to-end (by `dsaup2`) rather than by this module's fixtures.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsaitr from '@stdlib/arpack/base/dsaitr/lib/index.js';

var N = 5;
var A = new Float64Array([
    2.5, 0.3, 0.1, 0.0, 0.0,
    0.3, 3.0, -0.4, 0.0, 0.0,
    0.1, -0.4, 3.5, 0.2, 0.0,
    0.0, 0.0, 0.2, 4.0, -0.6,
    0.0, 0.0, 0.0, -0.6, 4.5
]);
var np = 3;
var resid = new Float64Array( [ 1.0, 0.3, -0.7, 0.5, -0.2 ] );

var s = 0.0;
var i;
for ( i = 0; i < N; i++ ) {
    s += resid[ i ] * resid[ i ];
}
var rnorm = new Float64Array( [ Math.sqrt( s ) ] );
var V = new Float64Array( N * np );
var H = new Float64Array( np * 2 );
var workd = new Float64Array( 3 * N );
var ipntr = new Int32Array( 3 );
var ido = new Int32Array( 1 );
var state = {};
for ( i = 0; i < N; i++ ) {
    workd[ i ] = resid[ i ];
}

do {
    dsaitr( state, ido, 'standard', N, 0, np, 1, resid, rnorm, V, N, H, np, ipntr, workd );
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

console.log( H );
```

</section>

<!-- /.examples -->

<section class="links">

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

</section>

<!-- /.links -->
