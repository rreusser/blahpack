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

# zgsvj0

> Pre-processor for `zgesvj` performing a sweep of Jacobi plane rotations on a complex matrix.

<section class="intro">

`zgsvj0` applies a sequence of Jacobi rotations from the right to the M-by-N complex matrix `A*diag(D)` in column-pivoted cyclic order. The complex vector `D` accumulates rotation phases (`D(p) <- -D(q) * ompq`) and the real vector `SVA` holds the Euclidean column norms `||A(:,j)||`. The routine does **not** check the convergence criterion — it simply performs `nsweep` row-cyclic sweeps with a row-skipping heuristic. It is intended to be called from `zgesvj` as a preprocessor.

</section>

<section class="usage">

## Usage

```javascript
var zgsvj0 = require( '@stdlib/lapack/base/zgsvj0' );
```

#### zgsvj0( order, jobv, M, N, A, LDA, d, strideD, sva, strideSVA, mv, V, LDV, eps, sfmin, tol, nsweep, work, strideWORK, lwork )

Performs a row-cyclic sweep of Jacobi plane rotations on `A*diag(D)`, optionally accumulating rotations into `V`.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var reinterpret = require( '@stdlib/strided/base/reinterpret-complex128' );

var M = 4;
var N = 3;
var A = new Complex128Array( M * N );
// ... fill A ...

var d = new Complex128Array( N );
var dv = reinterpret( d, 0 );
var i;
for ( i = 0; i < N; i++ ) {
    dv[ i * 2 ] = 1.0;
}

var sva = new Float64Array( N );
// ... fill sva with column norms of A ...

var V = new Complex128Array( 1 );
var work = new Complex128Array( M );

var info = zgsvj0( 'column-major', 'no-v', M, N, A, M, d, 1, sva, 1, 0, V, 1, 2.22e-16, 2.22e-308, 1e-10, 5, work, 1, M );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **jobv**: rotation accumulation mode — `'compute-v'`, `'apply-v'`, or `'no-v'`.
-   **M**: number of rows of `A`.
-   **N**: number of columns of `A`.
-   **A**: input/output complex matrix (`Complex128Array`).
-   **LDA**: leading dimension of `A`.
-   **d**: complex N-length phase accumulator (`Complex128Array`).
-   **strideD**: stride length for `d` (in complex elements).
-   **sva**: real N-length array of Euclidean column norms `||A(:,j)||` (`Float64Array`).
-   **strideSVA**: stride length for `sva`.
-   **mv**: number of rows of `V` when `jobv = 'apply-v'`.
-   **V**: complex matrix to update when `jobv` is `'compute-v'` or `'apply-v'` (`Complex128Array`).
-   **LDV**: leading dimension of `V`.
-   **eps**: machine epsilon (e.g. `2.220446049250313e-16`).
-   **sfmin**: safe minimum (e.g. `2.2250738585072014e-308`).
-   **tol**: convergence tolerance (must be `> eps`).
-   **nsweep**: maximum number of sweeps to perform.
-   **work**: complex workspace (`Complex128Array`), length at least `M`.
-   **strideWORK**: stride length for `work` (in complex elements).
-   **lwork**: declared length of `work`; must be `>= M`.

Returns `0` on convergence; otherwise returns the index of the last completed sweep.

#### zgsvj0.ndarray( jobv, M, N, A, strideA1, strideA2, offsetA, d, strideD, offsetD, sva, strideSVA, offsetSVA, mv, V, strideV1, strideV2, offsetV, eps, sfmin, tol, nsweep, work, strideWORK, offsetWORK, lwork )

Same operation, but exposing explicit per-dimension strides and offsets (`ndarray` convention). All strides and offsets are in complex elements (not bytes, not doubles).

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `D` is a phase accumulator: it is updated *only* via `D(p) <- -D(q)*ompq` after each rotation, and is never read inside any inner computation. `A`, `V`, and `SVA` carry the load-bearing state.
-   `jobv` strings are long-form: `'compute-v'`, `'apply-v'`, `'no-v'`. Single-character Fortran flags (`'V'`, `'A'`, `'N'`) are rejected by the validator.
-   The complex sine for each `zrot` call is `conj(ompq)*sn` (or `conj(ompq)*t` in the trivial-rotation branch). This is reused for both the `A` and `V` updates inside a rotation.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var reinterpret = require( '@stdlib/strided/base/reinterpret-complex128' );
var zgsvj0 = require( '@stdlib/lapack/base/zgsvj0' );

var EPS = 2.220446049250313e-16;
var SFMIN = 2.2250738585072014e-308;
var TOL = 1.0e-10;

var M = 4;
var N = 3;
var A = new Complex128Array( M * N );
var Av = reinterpret( A, 0 );
var d = new Complex128Array( N );
var dv = reinterpret( d, 0 );
var sva = new Float64Array( N );
var V = new Complex128Array( 1 );
var work = new Complex128Array( M );
var info;
var s;
var i;
var j;
var idx;

for ( i = 0; i < 2 * M * N; i++ ) {
    Av[ i ] = Math.sin( ( i + 1 ) * 0.31 );
}
for ( i = 0; i < N; i++ ) {
    dv[ i * 2 ] = 1.0;
}
for ( i = 0; i < N; i++ ) {
    s = 0;
    for ( j = 0; j < M; j++ ) {
        idx = ( ( i * M ) + j ) * 2;
        s += ( Av[ idx ] * Av[ idx ] ) + ( Av[ idx + 1 ] * Av[ idx + 1 ] );
    }
    sva[ i ] = Math.sqrt( s );
}

info = zgsvj0( 'column-major', 'no-v', M, N, A, M, d, 1, sva, 1, 0, V, 1, EPS, SFMIN, TOL, 5, work, 1, M );
console.log( info );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/zgsvj0.f; do not edit) -->

<section class="fortran-docs">

## Reference notes

The mathematical description from the reference LAPACK 3.12.0 source of `ZGSVJ0`. Indices are the 1-based Fortran indices of the source.

### Purpose

ZGSVJ0 is called from ZGESVJ as a pre-processor and that is its main purpose. It applies Jacobi rotations in the same way as ZGESVJ does, but it does not check convergence (stopping criterion). Few tuning parameters (marked by \[TP\]) are available for the implementer.

### Further Details

ZGSVJ0 is used just to enable ZGESVJ to call a simplified version of itself to work on a submatrix of the original matrix.

Contributor:

Zlatko Drmac (Zagreb, Croatia)

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

</section>

<!-- /.links -->
