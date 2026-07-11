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

# dsyconvf

> If parameter WAY = 'C': DSYCONVF converts the factorization output format used in DSYTRF provided on entry in parameter A into the factorization output format used in DSYTRF_RK (or DSYTRF_BK) that is stored on exit in parameters A and E

<section class="usage">

## Usage

```javascript
var dsyconvf = require( '@stdlib/lapack/base/dsyconvf' );
```

#### dsyconvf( order, uplo, way, N, A, LDA, e, strideE, IPIV, strideIPIV, offsetIPIV )

If parameter WAY = 'C': DSYCONVF converts the factorization output format used in DSYTRF provided on entry in parameter A into the factorization output format used in DSYTRF_RK (or DSYTRF_BK) that is stored on exit in parameters A and E

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );

var A = new Float64Array( [ 1.0, 0.0, 0.0, 2.0, 5.0, 0.0, 3.0, 6.0, 9.0 ] );
var E = new Float64Array( 3 );
var IPIV = new Int32Array( [ 0, 1, 2 ] );

dsyconvf( 'column-major', 'upper', 'convert', 3, A, 3, E, 1, IPIV, 1, 0 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **uplo**: `'upper'` or `'lower'`.
-   **way**: `'convert'` (`dsytrf` → `dsytrf_rk`) or `'revert'` (inverse transformation).
-   **N**: number of columns.
-   **A**: input matrix.
-   **LDA**: leading dimension of `A`.
-   **e**: input array.
-   **strideE**: stride length for `e`.
-   **IPIV**: output array.
-   **strideIPIV**: stride length for `IPIV`.
-   **offsetIPIV**: starting index for `IPIV`.

#### dsyconvf.ndarray( uplo, way, N, A, strideA1, strideA2, offsetA, e, strideE, offsetE, IPIV, strideIPIV, offsetIPIV )

If parameter WAY = 'C': DSYCONVF converts the factorization output format used in DSYTRF provided on entry in parameter A into the factorization output format used in DSYTRF_RK (or DSYTRF_BK) that is stored on exit in parameters A and E, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );

var A = new Float64Array( [ 1.0, 0.0, 0.0, 2.0, 5.0, 0.0, 3.0, 6.0, 9.0 ] );
var E = new Float64Array( 3 );
var IPIV = new Int32Array( [ 0, 1, 2 ] );

dsyconvf.ndarray( 'upper', 'convert', 3, A, 1, 3, 0, E, 1, 0, IPIV, 1, 0 );
```

The function has the following additional parameters:

-   **uplo**: `'upper'` or `'lower'`.
-   **way**: `'convert'` or `'revert'`.
-   **N**: number of columns.
-   **A**: input matrix.
-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **e**: input array.
-   **strideE**: stride length for `e`.
-   **offsetE**: starting index for `E`.
-   **IPIV**: output array.
-   **strideIPIV**: stride length for `IPIV`.
-   **offsetIPIV**: starting index for `IPIV`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `IPIV` uses 0-based indices. A negative entry `v` encodes the upper (or lower) element of a 2x2 pivot block and represents the 0-based row index `~v` (bitwise NOT).
-   When `way = 'convert'`, the routine extracts the off-diagonal entries of the block-diagonal factor `D` into `E` and rewrites `IPIV` into the `dsytrf_rk` format. When `way = 'revert'`, it performs the inverse transformation.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var dsyconvf = require( '@stdlib/lapack/base/dsyconvf' );

var N = 3;
var A = new Float64Array( [ 1.0, 0.0, 0.0, 2.0, 5.0, 0.0, 3.0, 6.0, 9.0 ] );
var E = new Float64Array( N );
var IPIV = new Int32Array( [ 0, 1, 2 ] );

dsyconvf( 'column-major', 'upper', 'convert', N, A, N, E, 1, IPIV, 1, 0 );
console.log( A );
console.log( E );
```

</section>

<!-- /.examples -->

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
