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

# dsytrf_aa

> Computes the factorization of a real symmetric matrix using Aasen's algorithm (blocked).

The factorization has the form `A = U^T * T * U` (upper) or `A = L * T * L^T` (lower),
where `T` is a symmetric tridiagonal matrix and `U` (or `L`) is a product of permutation
and unit upper (lower) triangular matrices.

<section class="usage">

## Usage

```javascript
var dsytrfAa = require( '@stdlib/lapack/base/dsytrf_aa' );
```

#### dsytrfAa( order, uplo, N, A, LDA, IPIV )

Computes the Aasen factorization of a real symmetric matrix `A`.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );

var A = new Float64Array([
    4, 2, 1, 0,
    0, 5, 2, 1,
    0, 0, 6, 3,
    0, 0, 0, 8
]);
var IPIV = new Int32Array( 4 );

var info = dsytrfAa( 'column-major', 'lower', 4, A, 4, IPIV );
// info => 0
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **uplo**: `'upper'` or `'lower'` — which triangle of `A` is referenced.
-   **N**: order of the matrix `A`.
-   **A**: input/output symmetric matrix (overwritten with the factor on exit).
-   **LDA**: leading dimension of `A`.
-   **IPIV**: pivot index output array (length `N`, 0-based indices).

#### dsytrfAa.ndarray( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV )

Computes the Aasen factorization using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );

var A = new Float64Array([
    4, 2, 1, 0,
    0, 5, 2, 1,
    0, 0, 6, 3,
    0, 0, 0, 8
]);
var IPIV = new Int32Array( 4 );

var info = dsytrfAa.ndarray( 'lower', 4, A, 1, 4, 0, IPIV, 1, 0 );
// info => 0
```

The function has the following additional parameters:

-   **strideA1**: stride of the first dimension of `A`.
-   **strideA2**: stride of the second dimension of `A`.
-   **offsetA**: starting index for `A`.
-   **strideIPIV**: stride length for `IPIV`.
-   **offsetIPIV**: starting index for `IPIV`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `IPIV` stores standard 0-based pivot indices. Aasen's algorithm does NOT use
    the Bunch-Kaufman negative-IPIV encoding (unlike `dsytrf`, `dsytrf_rk`, or
    `dsytrf_rook`).
-   On exit, the symmetric tridiagonal `T` is stored on the diagonals of `A`
    (with sub/superdiagonal stored adjacent), and `L` (or `U`) is stored below
    (or above) the subdiagonals.
-   The block size `NB` comes from `ilaenv` (64), as in the reference.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var dsytrfAa = require( '@stdlib/lapack/base/dsytrf_aa' );

var A = new Float64Array([
    4, 2, 1, 0,
    0, 5, 2, 1,
    0, 0, 6, 3,
    0, 0, 0, 8
]);
var IPIV = new Int32Array( 4 );

var info = dsytrfAa( 'column-major', 'lower', 4, A, 4, IPIV );
console.log( 'info: ' + info );
console.log( 'A: ' + A );
console.log( 'IPIV: ' + IPIV );
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
[mdn-int32array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int32Array

</section>

<!-- /.links -->
