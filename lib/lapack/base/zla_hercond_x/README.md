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

# zla_hercond_x

> Estimates the infinity norm condition number for a Hermitian indefinite matrix with x scaling

<section class="usage">

## Usage

```javascript
var zla_hercond_x = require( '@stdlib/lapack/base/zla_hercond_x' );
```

#### zla_hercond_x( order, uplo, N, A, LDA, AF, LDAF, IPIV, strideIPIV, offsetIPIV, x, strideX, WORK, strideWORK, RWORK, strideRWORK )

Estimates the infinity norm condition number for a Hermitian indefinite matrix with x scaling

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );

var A = new Complex128Array( [ 2, 0, 1, 0, 1, 0, 3, 0 ] );
var AF = new Complex128Array( A );
var IPIV = new Int32Array( [ 0, 1 ] );
var X = new Complex128Array( [ 1, 0, 1, 0 ] );
var WORK = new Complex128Array( 4 );
var RWORK = new Float64Array( 2 );

var rcond = zla_hercond_x( 'column-major', 'upper', 2, A, 2, AF, 2, IPIV, 1, 0, X, 1, WORK, 1, RWORK, 1 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **uplo**: specifies the operation type.
-   **N**: number of columns.
-   **A**: input matrix.
-   **LDA**: leading dimension of `A`.
-   **AF**: input matrix.
-   **LDAF**: leading dimension of `AF`.
-   **IPIV**: input array.
-   **strideIPIV**: stride length for `IPIV`.
-   **offsetIPIV**: starting index for `IPIV`.
-   **x**: input array.
-   **strideX**: stride length for `x`.
-   **WORK**: input array.
-   **strideWORK**: stride length for `WORK`.
-   **RWORK**: output array.
-   **strideRWORK**: stride length for `RWORK`.

#### zla_hercond_x.ndarray( uplo, N, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, x, strideX, offsetX, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK )

Estimates the infinity norm condition number for a Hermitian indefinite matrix with x scaling, using alternative indexing semantics.

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );

var A = new Complex128Array( [ 2, 0, 1, 0, 1, 0, 3, 0 ] );
var AF = new Complex128Array( A );
var IPIV = new Int32Array( [ 0, 1 ] );
var X = new Complex128Array( [ 1, 0, 1, 0 ] );
var WORK = new Complex128Array( 4 );
var RWORK = new Float64Array( 2 );

var rcond = zla_hercond_x.ndarray( 'upper', 2, A, 1, 2, 0, AF, 1, 2, 0, IPIV, 1, 0, X, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
```

The function has the following additional parameters:

-   **uplo**: specifies the operation type.
-   **N**: number of columns.
-   **A**: input matrix.
-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **AF**: input matrix.
-   **strideAF1**: stride of dimension 1 of `AF`.
-   **strideAF2**: stride of dimension 2 of `AF`.
-   **offsetAF**: starting index for `AF`.
-   **IPIV**: input array.
-   **strideIPIV**: stride length for `IPIV`.
-   **offsetIPIV**: starting index for `IPIV`.
-   **x**: input array.
-   **strideX**: stride length for `x`.
-   **offsetX**: starting index for `X`.
-   **WORK**: input array.
-   **strideWORK**: stride length for `WORK`.
-   **offsetWORK**: starting index for `WORK`.
-   **RWORK**: output array.
-   **strideRWORK**: stride length for `RWORK`.
-   **offsetRWORK**: starting index for `RWORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `WORK` must have length at least `2*N` complex elements.
-   `RWORK` must have length at least `N` double elements.
-   `X` is multiplied elementwise into the columns of `A` (complex vector scaling).
-   `AF` and `IPIV` must come from a prior `zhetrf` factorization.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var zla_hercond_x = require( '@stdlib/lapack/base/zla_hercond_x' );

var A = new Complex128Array( [ 4, 0, 1, 2, 1, -2, 5, 0 ] );
var AF = new Complex128Array( A );
var IPIV = new Int32Array( [ 0, 1 ] );
var X = new Complex128Array( [ 1, 0, 1, 0 ] );
var WORK = new Complex128Array( 4 );
var RWORK = new Float64Array( 2 );

var rcond = zla_hercond_x( 'column-major', 'upper', 2, A, 2, AF, 2, IPIV, 1, 0, X, 1, WORK, 1, RWORK, 1 );
console.log( rcond );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/zla_hercond_x.f; do not edit) -->

<section class="fortran-docs">

## Reference documentation

From the reference LAPACK 3.12.0 source of `ZLA_HERCOND_X`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

> Computes the infinity norm condition number of $\operatorname{op}(A) \, \operatorname{diag}(x)$ for Hermitian indefinite matrices.

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array
[mdn-float32array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array
[mdn-int32array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int32Array
[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->
