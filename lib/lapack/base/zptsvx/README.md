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

# zptsvx

> @license Apache-2.0.

<section class="usage">

## Usage

```javascript
var zptsvx = require( '@stdlib/lapack/base/zptsvx' );
```

#### zptsvx( fact, N, nrhs, d, e, DF, EF, B, LDB, X, LDX, rcond, FERR, BERR, WORK, RWORK )

@license Apache-2.0.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var zptsvx = require( '@stdlib/lapack/base/zptsvx' );

var d = new Float64Array( [ 4.0, 5.0, 6.0, 7.0 ] );
var e = new Complex128Array( [ 1.0, 0.5, 0.5, -0.3, 0.2, 0.1 ] );
var df = new Float64Array( 4 );
var ef = new Complex128Array( 3 );
var x = new Complex128Array( 4 );
var rcond = new Float64Array( 1 );
var ferr = new Float64Array( 1 );
var berr = new Float64Array( 1 );
var work = new Complex128Array( 4 );
var rwork = new Float64Array( 4 );

zptsvx.ndarray( 'not-factored', 4, 1, d, 1, 0, e, 1, 0, df, 1, 0, ef, 1, 0, b, 1, 4, 0, x, 1, 4, 0, rcond, ferr, 1, 0, berr, 1, 0, work, 1, 0, rwork, 1, 0 );
```

The function has the following parameters:

-   **fact**: `fact`.
-   **N**: number of columns.
-   **nrhs**: number of right-hand sides.
-   **d**: `d`.
-   **e**: `e`.
-   **DF**: input array `DF`.
-   **EF**: input array `EF`.
-   **B**: input array `B`.
-   **LDB**: leading dimension of `B`.
-   **X**: input array `X`.
-   **LDX**: leading dimension of `X`.
-   **rcond**: `rcond`.
-   **FERR**: input array `FERR`.
-   **BERR**: input array `BERR`.
-   **WORK**: input array `WORK`.
-   **RWORK**: input array `RWORK`.

#### zptsvx.ndarray( fact, N, nrhs, d, strideD, offsetD, e, strideE, offsetE, DF, strideDF, offsetDF, EF, strideEF, offsetEF, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, rcond, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK )

@license Apache-2.0, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var zptsvx = require( '@stdlib/lapack/base/zptsvx' );

var d = new Float64Array( [ 4.0, 5.0, 6.0, 7.0 ] );
var e = new Complex128Array( [ 1.0, 0.5, 0.5, -0.3, 0.2, 0.1 ] );
var df = new Float64Array( 4 );
var ef = new Complex128Array( 3 );
var x = new Complex128Array( 4 );
var rcond = new Float64Array( 1 );
var ferr = new Float64Array( 1 );
var berr = new Float64Array( 1 );
var work = new Complex128Array( 4 );
var rwork = new Float64Array( 4 );

zptsvx.ndarray( 'not-factored', 4, 1, d, 1, 0, e, 1, 0, df, 1, 0, ef, 1, 0, b, 1, 4, 0, x, 1, 4, 0, rcond, ferr, 1, 0, berr, 1, 0, work, 1, 0, rwork, 1, 0 );
```

The function has the following additional parameters:

-   **strideD**: stride length for `D`.
-   **offsetD**: starting index for `D`.
-   **strideE**: stride length for `E`.
-   **offsetE**: starting index for `E`.
-   **strideDF**: stride length for `DF`.
-   **offsetDF**: starting index for `DF`.
-   **strideEF**: stride length for `EF`.
-   **offsetEF**: starting index for `EF`.
-   **strideB1**: stride of dimension 1 of `B`.
-   **strideB2**: stride of dimension 2 of `B`.
-   **offsetB**: starting index for `B`.
-   **strideX1**: stride of dimension 1 of `X`.
-   **strideX2**: stride of dimension 2 of `X`.
-   **offsetX**: starting index for `X`.
-   **strideFERR**: stride length for `FERR`.
-   **offsetFERR**: starting index for `FERR`.
-   **strideBERR**: stride length for `BERR`.
-   **offsetBERR**: starting index for `BERR`.
-   **strideWORK**: stride length for `WORK`.
-   **offsetWORK**: starting index for `WORK`.
-   **strideRWORK**: stride length for `RWORK`.
-   **offsetRWORK**: starting index for `RWORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zptsvx()` corresponds to the [LAPACK][lapack] level routine [`zptsvx`][lapack-zptsvx].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var zptsvx = require( '@stdlib/lapack/base/zptsvx' );

var d = new Float64Array( [ 4.0, 5.0, 6.0, 7.0 ] );
var e = new Complex128Array( [ 1.0, 0.5, 0.5, -0.3, 0.2, 0.1 ] );
var df = new Float64Array( 4 );
var ef = new Complex128Array( 3 );
var x = new Complex128Array( 4 );
var rcond = new Float64Array( 1 );
var ferr = new Float64Array( 1 );
var berr = new Float64Array( 1 );
var work = new Complex128Array( 4 );
var rwork = new Float64Array( 4 );

zptsvx.ndarray( 'not-factored', 4, 1, d, 1, 0, e, 1, 0, df, 1, 0, ef, 1, 0, b, 1, 4, 0, x, 1, 4, 0, rcond, ferr, 1, 0, berr, 1, 0, work, 1, 0, rwork, 1, 0 );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/zptsvx.f; do not edit) -->

<section class="fortran-docs">

## Reference notes

The mathematical description from the reference LAPACK 3.12.0 source of `ZPTSVX`. Indices are the 1-based Fortran indices of the source.

### Purpose

ZPTSVX uses the factorization $A = L \, D \, L^H$ to compute the solution to a complex system of linear equations $A \, X = B$, where A is an N-by-N Hermitian positive definite tridiagonal matrix and X and B are N-by-`NRHS` matrices.

Error bounds on the solution and a condition estimate are also provided.

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[lapack]: https://www.netlib.org/lapack/explore-html/

[lapack-zptsvx]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zptsvx.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->