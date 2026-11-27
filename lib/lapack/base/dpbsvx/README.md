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

# dpbsvx

> @license Apache-2.0.

<section class="usage">

## Usage

```javascript
var dpbsvx = require( '@stdlib/lapack/base/dpbsvx' );
```

#### dpbsvx( fact, uplo, N, kd, nrhs, AB, LDAB, AFB, LDAFB, equed, S, strideS, B, LDB, X, LDX, rcond, FERR, strideFERR, BERR, strideBERR, WORK, strideWORK, IWORK, strideIWORK )

@license Apache-2.0.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var dpbsvx = require( '@stdlib/lapack/base/dpbsvx' );

var AB = new Float64Array( [ 4.0, 2.0, 1.0, 5.0, 3.0, 0.0, 6.0, 0.0, 0.0 ] );
var AFB = new Float64Array( 9 );
var S = new Float64Array( 3 );
var equed = [ 'none' ];
var B = new Float64Array( [ 7.0, 10.0, 10.0 ] );
var X = new Float64Array( 3 );
var rcond = new Float64Array( 1 );
var FERR = new Float64Array( 1 );
var BERR = new Float64Array( 1 );
var WORK = new Float64Array( 9 );
var IWORK = new Int32Array( 3 );

dpbsvx.ndarray( 'not-factored', 'lower', 3, 2, 1, AB, 1, 3, 0, AFB, 1, 3, 0, equed, S, 1, 0, B, 1, 3, 0, X, 1, 3, 0, rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
```

The function has the following parameters:

-   **fact**: `fact`.
-   **uplo**: specifies whether the upper or lower triangular part is referenced.
-   **N**: number of columns.
-   **kd**: `kd`.
-   **nrhs**: number of right-hand sides.
-   **AB**: input array `AB`.
-   **LDAB**: leading dimension of `AB`.
-   **AFB**: input array `AFB`.
-   **LDAFB**: leading dimension of `AFB`.
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
-   **IWORK**: input array `IWORK`.
-   **strideIWORK**: stride length for `IWORK`.

#### dpbsvx.ndarray( fact, uplo, N, kd, nrhs, AB, strideAB1, strideAB2, offsetAB, AFB, strideAFB1, strideAFB2, offsetAFB, equed, S, strideS, offsetS, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, rcond, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK )

@license Apache-2.0, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var dpbsvx = require( '@stdlib/lapack/base/dpbsvx' );

var AB = new Float64Array( [ 4.0, 2.0, 1.0, 5.0, 3.0, 0.0, 6.0, 0.0, 0.0 ] );
var AFB = new Float64Array( 9 );
var S = new Float64Array( 3 );
var equed = [ 'none' ];
var B = new Float64Array( [ 7.0, 10.0, 10.0 ] );
var X = new Float64Array( 3 );
var rcond = new Float64Array( 1 );
var FERR = new Float64Array( 1 );
var BERR = new Float64Array( 1 );
var WORK = new Float64Array( 9 );
var IWORK = new Int32Array( 3 );

dpbsvx.ndarray( 'not-factored', 'lower', 3, 2, 1, AB, 1, 3, 0, AFB, 1, 3, 0, equed, S, 1, 0, B, 1, 3, 0, X, 1, 3, 0, rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
```

The function has the following additional parameters:

-   **strideAB1**: stride of dimension 1 of `AB`.
-   **strideAB2**: stride of dimension 2 of `AB`.
-   **offsetAB**: starting index for `AB`.
-   **strideAFB1**: stride of dimension 1 of `AFB`.
-   **strideAFB2**: stride of dimension 2 of `AFB`.
-   **offsetAFB**: starting index for `AFB`.
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
-   **offsetIWORK**: starting index for `IWORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dpbsvx()` corresponds to the [LAPACK][lapack] level routine [`dpbsvx`][lapack-dpbsvx].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var dpbsvx = require( '@stdlib/lapack/base/dpbsvx' );

var AB = new Float64Array( [ 4.0, 2.0, 1.0, 5.0, 3.0, 0.0, 6.0, 0.0, 0.0 ] );
var AFB = new Float64Array( 9 );
var S = new Float64Array( 3 );
var equed = [ 'none' ];
var B = new Float64Array( [ 7.0, 10.0, 10.0 ] );
var X = new Float64Array( 3 );
var rcond = new Float64Array( 1 );
var FERR = new Float64Array( 1 );
var BERR = new Float64Array( 1 );
var WORK = new Float64Array( 9 );
var IWORK = new Int32Array( 3 );

dpbsvx.ndarray( 'not-factored', 'lower', 3, 2, 1, AB, 1, 3, 0, AFB, 1, 3, 0, equed, S, 1, 0, B, 1, 3, 0, X, 1, 3, 0, rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/dpbsvx.f; do not edit) -->

<section class="fortran-docs">

## Reference notes

The mathematical description from the reference LAPACK 3.12.0 source of `DPBSVX`. Indices are the 1-based Fortran indices of the source.

### Purpose

DPBSVX uses the Cholesky factorization $A = U^T \, U$ or $A = L \, L^T$ to compute the solution to a real system of linear equations

$$
A \, X = B
$$

where A is an N-by-N symmetric positive definite band matrix and X and B are N-by-`NRHS` matrices.

Error bounds on the solution and a condition estimate are also provided.

### Further Details

The band storage scheme is illustrated by the following example, when $N = 6$, `KD = 2`, and `UPLO = 'U'`:

Two-dimensional storage of the symmetric matrix A:

a11 a12 a13

a22 a23 a24 a33 a34 a35 a44 a45 a46 a55 a56

(aij=conjg(aji)) a66

Band storage of the upper triangle of A:

\* \* a13 a24 a35 $a_{46} \, a_{12}$ a23 a34 a45 a56 a11 a22 a33 a44 a55 a66

Similarly, if `UPLO = 'L'` the format of A is as follows:

a11 a22 a33 a44 a55 a66 a21 a32 a43 a54 $a_{65} \, a_{31}$ a42 a53 a64 \* \*

Array elements marked \* are not used by the routine.

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[lapack]: https://www.netlib.org/lapack/explore-html/

[lapack-dpbsvx]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dpbsvx.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->