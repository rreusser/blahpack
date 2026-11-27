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

# zppsvx

> Solves a complex Hermitian positive definite system A*X = B where A is in packed storage, with optional equilibration, condition estimation, and error bounds.

<section class="usage">

## Usage

```javascript
var zppsvx = require( '@stdlib/lapack/base/zppsvx' );
```

#### zppsvx( fact, uplo, N, nrhs, AP, AFP, equed, S, strideS, B, LDB, X, LDX, rcond, FERR, strideFERR, BERR, strideBERR, WORK, strideWORK, RWORK, strideRWORK )

Solves a complex Hermitian positive definite system A*X = B where A is in packed storage, with optional equilibration, condition estimation, and error bounds.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var zppsvx = require( '@stdlib/lapack/base/zppsvx' );

var AFP = new Complex128Array( 6 );
var S = new Float64Array( 3 );
var equed = [ 'none' ];
var B = new Complex128Array( new Float64Array( [ 1, 1, 2, -1, 3, 0.5 ] ) );
var X = new Complex128Array( 3 );
var rcond = new Float64Array( 1 );
var FERR = new Float64Array( 1 );
var BERR = new Float64Array( 1 );
var WORK = new Complex128Array( 6 );
var RWORK = new Float64Array( 3 );

zppsvx.ndarray( 'not-factored', 'upper', 3, 1, AP, 1, 0, AFP, 1, 0, equed, S, 1, 0, B, 1, 3, 0, X, 1, 3, 0, rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
```

The function has the following parameters:

-   **fact**: `fact`.
-   **uplo**: specifies whether the upper or lower triangular part is referenced.
-   **N**: number of columns.
-   **nrhs**: number of right-hand sides.
-   **AP**: input array `AP`.
-   **AFP**: input array `AFP`.
-   **equed**: `equed`.
-   **S**: input array `S`.
-   **strideS**: stride length for `S`.
-   **B**: input array `B`.
-   **LDB**: leading dimension of `B`.
-   **X**: input array `X`.
-   **LDX**: leading dimension of `X`.
-   **rcond**: `rcond`.
-   **FERR**: input array `FERR`.
-   **strideFERR**: stride length for `FERR`.
-   **BERR**: input array `BERR`.
-   **strideBERR**: stride length for `BERR`.
-   **WORK**: input array `WORK`.
-   **strideWORK**: stride length for `WORK`.
-   **RWORK**: input array `RWORK`.
-   **strideRWORK**: stride length for `RWORK`.

#### zppsvx.ndarray( fact, uplo, N, nrhs, AP, strideAP, offsetAP, AFP, strideAFP, offsetAFP, equed, S, strideS, offsetS, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, rcond, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK )

Solves a complex Hermitian positive definite system A*X = B where A is in packed storage, with optional equilibration, condition estimation, and error bounds, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var zppsvx = require( '@stdlib/lapack/base/zppsvx' );

var AFP = new Complex128Array( 6 );
var S = new Float64Array( 3 );
var equed = [ 'none' ];
var B = new Complex128Array( new Float64Array( [ 1, 1, 2, -1, 3, 0.5 ] ) );
var X = new Complex128Array( 3 );
var rcond = new Float64Array( 1 );
var FERR = new Float64Array( 1 );
var BERR = new Float64Array( 1 );
var WORK = new Complex128Array( 6 );
var RWORK = new Float64Array( 3 );

zppsvx.ndarray( 'not-factored', 'upper', 3, 1, AP, 1, 0, AFP, 1, 0, equed, S, 1, 0, B, 1, 3, 0, X, 1, 3, 0, rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
```

The function has the following additional parameters:

-   **strideAP**: stride length for `AP`.
-   **offsetAP**: starting index for `AP`.
-   **strideAFP**: stride length for `AFP`.
-   **offsetAFP**: starting index for `AFP`.
-   **offsetS**: starting index for `S`.
-   **strideB1**: stride of dimension 1 of `B`.
-   **strideB2**: stride of dimension 2 of `B`.
-   **offsetB**: starting index for `B`.
-   **strideX1**: stride of dimension 1 of `X`.
-   **strideX2**: stride of dimension 2 of `X`.
-   **offsetX**: starting index for `X`.
-   **offsetFERR**: starting index for `FERR`.
-   **offsetBERR**: starting index for `BERR`.
-   **offsetWORK**: starting index for `WORK`.
-   **offsetRWORK**: starting index for `RWORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zppsvx()` corresponds to the [LAPACK][lapack] level routine [`zppsvx`][lapack-zppsvx].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var zppsvx = require( '@stdlib/lapack/base/zppsvx' );

var AFP = new Complex128Array( 6 );
var S = new Float64Array( 3 );
var equed = [ 'none' ];
var B = new Complex128Array( new Float64Array( [ 1, 1, 2, -1, 3, 0.5 ] ) );
var X = new Complex128Array( 3 );
var rcond = new Float64Array( 1 );
var FERR = new Float64Array( 1 );
var BERR = new Float64Array( 1 );
var WORK = new Complex128Array( 6 );
var RWORK = new Float64Array( 3 );

zppsvx.ndarray( 'not-factored', 'upper', 3, 1, AP, 1, 0, AFP, 1, 0, equed, S, 1, 0, B, 1, 3, 0, X, 1, 3, 0, rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/zppsvx.f; do not edit) -->

<section class="fortran-docs">

## Reference notes

The mathematical description from the reference LAPACK 3.12.0 source of `ZPPSVX`. Indices are the 1-based Fortran indices of the source.

### Purpose

ZPPSVX uses the Cholesky factorization $A = U^H \, U$ or $A = L \, L^H$ to compute the solution to a complex system of linear equations

$$
A \, X = B
$$

where A is an N-by-N Hermitian positive definite matrix stored in packed format and X and B are N-by-`NRHS` matrices.

Error bounds on the solution and a condition estimate are also provided.

### Further Details

The packed storage scheme is illustrated by the following example when $N = 4$, `UPLO = 'U'`:

Two-dimensional storage of the Hermitian matrix A:

a11 a12 a13 a14

a22 a23 a24 a33 a34 (aij = conjg(aji)) a44

Packed storage of the upper triangle of A:

`AP` = \[ a11, a12, a22, a13, a23, a33, a14, a24, a34, a44 \]

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[lapack]: https://www.netlib.org/lapack/explore-html/

[lapack-zppsvx]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zppsvx.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->