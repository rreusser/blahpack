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

# dgetv0

> Generate the initial residual vector for the symmetric Lanczos/Arnoldi iteration, orthogonal to the current basis (reverse communication).

<section class="usage">

## Usage

```javascript
import dgetv0 from '@stdlib/arpack/base/dgetv0/lib/index.js';
```

#### dgetv0( state, ido, bmat, itry, initv, N, j, V, ldv, resid, rnorm, ipntr, workd )

Generates (and B-orthogonalizes against the first `j-1` columns of `V`) a starting residual vector, using **reverse communication**: the caller drives `dgetv0` in a loop, applying the operators `OP` and `B` when asked.

```javascript
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';

var N = 4;
var A = new Float64Array( [ 2.0, -1.0, 0.0, 0.0, -1.0, 2.0, -1.0, 0.0, 0.0, -1.0, 2.0, -1.0, 0.0, 0.0, -1.0, 2.0 ] );
var V = new Float64Array( N );
var resid = new Float64Array( N );
var workd = new Float64Array( 2*N );
var rnorm = new Float64Array( 1 );
var ipntr = new Int32Array( 3 );
var ido = new Int32Array( 1 );
var state = {};

var ierr = 0;
do {
    ierr = dgetv0( state, ido, 'standard', 1, false, N, 1, V, N, resid, rnorm, ipntr, workd );
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
// rnorm[ 0 ] holds the norm of the starting vector.
```

### Reverse communication

The caller dispatches on `ido[ 0 ]`:

-   `0` on the first call.
-   `-1` (or `1`): compute `Y = OP*X`, with `X` at `workd[ ipntr[ 0 ] .. ]` and `Y` written to `workd[ ipntr[ 1 ] .. ]`.
-   `2`: compute `Y = B*X` (generalized problem, `bmat = 'generalized'`).
-   `99`: done.

The `state` object holds the reverse-communication state that must persist across calls (the Fortran `SAVE` variables). Create `const state = {}` once and pass it to every call.

The function has the following parameters:

-   **state**: persistent reverse-communication state (`{}` on first use).
-   **ido**: `Int32Array` reverse-communication flag (length-1; in/out).
-   **bmat**: `'standard'` or `'generalized'` eigenproblem.
-   **itry**: restart attempt counter (`>= 1`).
-   **initv**: if `true`, `resid` already holds an initial vector; if `false`, it is randomized.
-   **N**: order of the problem.
-   **j**: index of the residual vector to be generated.
-   **V**: `Float64Array` Lanczos/Arnoldi basis (`N`-by-`j`, column-major).
-   **ldv**: leading dimension of `V`.
-   **resid**: `Float64Array` residual vector (length `N`; in/out).
-   **rnorm**: `Float64Array` receiving the B-norm of the residual (length-1; out).
-   **ipntr**: `Int32Array` operator pointers into `workd` (0-based; out).
-   **workd**: `Float64Array` reverse-communication workspace (length `>= 2*N`).

The function returns `IERR`: `0` on success, `-1` if iterative refinement failed to produce an orthogonal vector.

#### dgetv0.ndarray( state, ido, bmat, itry, initv, N, j, V, strideV1, strideV2, offsetV, resid, strideResid, offsetResid, rnorm, ipntr, strideIpntr, offsetIpntr, workd, strideWorkd, offsetWorkd )

Same computation, using alternative indexing semantics: `V` takes two strides and an offset, and each vector takes an explicit stride and offset.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dgetv0` corresponds to the ARPACK routine `dgetv0`, translated from the reference Fortran (arpack-ng 3.9.1). `ipntr` values are 0-based (the reference uses 1-based Fortran indices). The random-seed portion of the state persists across invocation sequences, matching the reference `SAVE` semantics.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgetv0 from '@stdlib/arpack/base/dgetv0/lib/index.js';

var N = 4;
var A = new Float64Array( [ 2.0, -1.0, 0.0, 0.0, -1.0, 2.0, -1.0, 0.0, 0.0, -1.0, 2.0, -1.0, 0.0, 0.0, -1.0, 2.0 ] );
var V = new Float64Array( N );
var resid = new Float64Array( N );
var workd = new Float64Array( 2*N );
var rnorm = new Float64Array( 1 );
var ipntr = new Int32Array( 3 );
var ido = new Int32Array( 1 );
var state = {};

var ierr = 0;
do {
    ierr = dgetv0( state, ido, 'standard', 1, false, N, 1, V, N, resid, rnorm, ipntr, workd );
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

console.log( rnorm[ 0 ] );
```

</section>

<!-- /.examples -->

<section class="links">

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

</section>

<!-- /.links -->
