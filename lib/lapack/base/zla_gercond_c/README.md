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

# zla_gercond_c

> Estimates the infinity norm condition number for a general complex matrix with inverse-c scaling

<section class="usage">

## Usage

```javascript
var zla_gercond_c = require( '@stdlib/lapack/base/zla_gercond_c' );
```

#### zla_gercond_c( order, trans, N, A, LDA, AF, LDAF, IPIV, strideIPIV, offsetIPIV, c, strideC, capply, WORK, strideWORK, RWORK, strideRWORK )

Estimates the infinity norm condition number for a general complex matrix with inverse-c scaling

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var zgetrf = require( '@stdlib/lapack/base/zgetrf' );

var N = 3;
var A = new Complex128Array( [ 2.0, 1.0, 1.0, 2.0, 0.0, 1.0, 1.0, 0.0, 3.0, 0.0, 1.0, -1.0, 0.0, -1.0, 1.0, 1.0, 4.0, 0.0 ] );
var AF = new Complex128Array( A.length );
for ( var i = 0; i < A.length; i++ ) { AF.set( A.get( i ), i ); }
var IPIV = new Int32Array( N );
var c = new Float64Array( [ 2.0, 0.5, 3.0 ] );
var WORK = new Complex128Array( 2 * N );
var RWORK = new Float64Array( N );

zgetrf( 'column-major', N, N, AF, N, IPIV );

var rcond = zla_gercond_c( 'column-major', 'no-transpose', N, A, N, AF, N, IPIV, 1, 0, c, 1, true, WORK, 1, RWORK, 1 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **trans**: specifies the operation type.
-   **N**: number of columns.
-   **A**: input matrix.
-   **LDA**: leading dimension of `A`.
-   **AF**: input matrix.
-   **LDAF**: leading dimension of `AF`.
-   **IPIV**: input array.
-   **strideIPIV**: stride length for `IPIV`.
-   **offsetIPIV**: starting index for `IPIV`.
-   **c**: input array.
-   **strideC**: stride length for `c`.
-   **capply**: capply.
-   **WORK**: input array.
-   **strideWORK**: stride length for `WORK`.
-   **RWORK**: output array.
-   **strideRWORK**: stride length for `RWORK`.

#### zla_gercond_c.ndarray( trans, N, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, c, strideC, offsetC, capply, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK )

Estimates the infinity norm condition number for a general complex matrix with inverse-c scaling, using alternative indexing semantics.

```javascript
// Using the ndarray interface, offsets are explicit:
var rcond = zla_gercond_c.ndarray( 'no-transpose', N, A, 1, N, 0, AF, 1, N, 0, IPIV, 1, 0, c, 1, 0, true, WORK, 1, 0, RWORK, 1, 0 );
```

The function has the following additional parameters:

-   **trans**: specifies the operation type.
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
-   **c**: input array.
-   **strideC**: stride length for `c`.
-   **offsetC**: starting index for `C`.
-   **capply**: capply.
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

-   `WORK` must have length at least `2*N` complex elements; `RWORK` must have length at least `N`.
-   `AF` and `IPIV` must come from a previous `zgetrf` factorization of `A`.
-   When `capply` is `true`, `C` is applied as inverse column scaling (`inv(diag(C))`); otherwise `C` is ignored.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var zgetrf = require( '@stdlib/lapack/base/zgetrf' );
var zla_gercond_c = require( '@stdlib/lapack/base/zla_gercond_c' );

var N = 3;
var A = new Complex128Array( [ 2.0, 1.0, 1.0, 2.0, 0.0, 1.0, 1.0, 0.0, 3.0, 0.0, 1.0, -1.0, 0.0, -1.0, 1.0, 1.0, 4.0, 0.0 ] );
var AF = new Complex128Array( A.length );
for ( var i = 0; i < A.length; i++ ) { AF.set( A.get( i ), i ); }
var IPIV = new Int32Array( N );
var c = new Float64Array( [ 2.0, 0.5, 3.0 ] );
var WORK = new Complex128Array( 2 * N );
var RWORK = new Float64Array( N );

zgetrf( 'column-major', N, N, AF, N, IPIV );

var rcond = zla_gercond_c( 'column-major', 'no-transpose', N, A, N, AF, N, IPIV, 1, 0, c, 1, true, WORK, 1, RWORK, 1 );
console.log( rcond );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/zla_gercond_c.f; do not edit) -->

<section class="fortran-docs">

## Reference documentation

From the reference LAPACK 3.12.0 source of `ZLA_GERCOND_C`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

> Computes the infinity norm condition number of $\operatorname{op}(A) \, \operatorname{inv}(\operatorname{diag}(c))$ for general matrices.

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
