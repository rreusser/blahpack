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

# zlasyf_rook

> Computes a partial factorization of a complex symmetric matrix using the bounded Bunch-Kaufman ("rook") diagonal pivoting method.

<section class="usage">

## Usage

```javascript
var zlasyf_rook = require( '@stdlib/lapack/base/zlasyf_rook' );
```

#### zlasyf_rook( order, uplo, N, nb, A, LDA, IPIV, W, LDW )

Computes a partial factorization of a complex symmetric matrix using the bounded Bunch-Kaufman ("rook") diagonal pivoting method.

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );

var N = 3;
var nb = 3;
var A = new Complex128Array( N * N );
var IPIV = new Int32Array( N );
var W = new Complex128Array( N * nb );

zlasyf_rook( 'column-major', 'lower', N, nb, A, N, IPIV, W, N );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **uplo**: `'upper'` or `'lower'`.
-   **N**: order of the matrix `A`.
-   **nb**: maximum number of columns to factor.
-   **A**: input/output complex symmetric matrix.
-   **LDA**: leading dimension of `A`.
-   **IPIV**: pivot index output array.
-   **W**: workspace matrix (`N x nb`).
-   **LDW**: leading dimension of `W`.

Returns an object `{ info, kb }` where `info = 0` indicates success and `kb` is the number of columns actually factorized.

#### zlasyf_rook.ndarray( uplo, N, nb, kb, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, W, strideW1, strideW2, offsetW )

Computes a partial factorization of a complex symmetric matrix using the bounded Bunch-Kaufman ("rook") diagonal pivoting method, using alternative indexing semantics.

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );

var N = 3;
var nb = 3;
var A = new Complex128Array( N * N );
var IPIV = new Int32Array( N );
var W = new Complex128Array( N * nb );

zlasyf_rook.ndarray( 'lower', N, nb, A, 1, N, 0, IPIV, 1, 0, W, 1, N, 0 );
```

The function has the following additional parameters:

-   **uplo**: `'upper'` or `'lower'`.
-   **N**: order of the matrix `A`.
-   **nb**: maximum number of columns to factor.
-   **A**: input/output complex symmetric matrix.
-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **IPIV**: pivot index output array.
-   **strideIPIV**: stride length for `IPIV`.
-   **offsetIPIV**: starting index for `IPIV`.
-   **W**: workspace matrix (`N x nb`).
-   **strideW1**: stride of dimension 1 of `W`.
-   **strideW2**: stride of dimension 2 of `W`.
-   **offsetW**: starting index for `W`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   Pivot indices follow the stdlib bitwise-NOT convention: 1x1 pivots use non-negative indices; 2x2 pivots use `~p` (bitwise NOT) for both rows of the block.
-   The matrix is treated as complex symmetric (NOT Hermitian); there is no conjugation at mirror reads and the diagonal may be fully complex.
-   See LAPACK reference documentation for full algorithmic details.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );
var zlasyf_rook = require( '@stdlib/lapack/base/zlasyf_rook' );

var N = 3;
var nb = 3;
var A = new Complex128Array( N * N );
var IPIV = new Int32Array( N );
var W = new Complex128Array( N * nb );

zlasyf_rook( 'column-major', 'lower', N, nb, A, N, IPIV, W, N );
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
