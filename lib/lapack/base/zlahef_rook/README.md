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

# zlahef_rook

> Computes a partial factorization of a complex Hermitian indefinite matrix using the bounded Bunch-Kaufman ("rook") diagonal pivoting method (blocked algorithm, calling Level 3 BLAS).

<section class="usage">

## Usage

```javascript
var zlahefRook = require( '@stdlib/lapack/base/zlahef_rook' );
```

#### zlahefRook( order, uplo, N, nb, A, LDA, IPIV, W, LDW )

Computes a partial factorization of a complex Hermitian indefinite matrix using the bounded Bunch-Kaufman ("rook") diagonal pivoting method (blocked algorithm, calling Level 3 BLAS).

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );

var A = new Complex128Array([
    4, 0,  1, 0.5,  2, -1,  0.5, 0.1,
    0, 0,  3, 0,  0.5, -0.2,  1, 0.3,
    0, 0,  0, 0,  5, 0,  0.2, -0.4,
    0, 0,  0, 0,  0, 0,  6, 0
]);
var IPIV = new Int32Array( 4 );
var W = new Complex128Array( 4 * 8 );

var result = zlahefRook( 'column-major', 'lower', 4, 8, A, 4, IPIV, W, 4 );
// returns { info, kb }
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **uplo**: matrix triangle to use (`'upper'` or `'lower'`).
-   **N**: order of the matrix `A`.
-   **nb**: maximum number of columns to factor.
-   **A**: input/output Hermitian matrix as a [`Complex128Array`][@stdlib/array/complex128].
-   **LDA**: leading dimension of `A`.
-   **IPIV**: pivot index output array as an [`Int32Array`][@stdlib/array/int32].
-   **W**: workspace matrix as a [`Complex128Array`][@stdlib/array/complex128] (`N x nb`).
-   **LDW**: leading dimension of `W`.

The function returns an object `{ info, kb }`:

-   **info**: `0` on success, or `k+1` (1-based) if the `k`-th pivot is exactly zero (factorization completed but `D` is singular).
-   **kb**: the number of columns actually factored. `kb` is either `nb` or `nb-1`, or `N` if `N <= nb`.

#### zlahefRook.ndarray( uplo, N, nb, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, W, strideW1, strideW2, offsetW )

Computes a partial factorization of a complex Hermitian indefinite matrix using the bounded Bunch-Kaufman ("rook") diagonal pivoting method (blocked algorithm, calling Level 3 BLAS), using alternative indexing semantics.

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );

var A = new Complex128Array([
    4, 0,  1, 0.5,  2, -1,  0.5, 0.1,
    0, 0,  3, 0,  0.5, -0.2,  1, 0.3,
    0, 0,  0, 0,  5, 0,  0.2, -0.4,
    0, 0,  0, 0,  0, 0,  6, 0
]);
var IPIV = new Int32Array( 4 );
var W = new Complex128Array( 4 * 8 );

var result = zlahefRook.ndarray( 'lower', 4, 8, A, 1, 4, 0, IPIV, 1, 0, W, 1, 4, 0 );
// returns { info, kb }
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **strideIPIV**: stride length for `IPIV`.
-   **offsetIPIV**: starting index for `IPIV`.
-   **strideW1**: stride of dimension 1 of `W`.
-   **strideW2**: stride of dimension 2 of `W`.
-   **offsetW**: starting index for `W`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zlahef_rook` is an auxiliary routine called by `zhetrf_rook`. It uses blocked code (calling Level-3 BLAS) to factor at most `nb` columns and update the trailing/leading submatrix.
-   The factorization has the form `A = U*D*U**H` (upper) or `A = L*D*L**H` (lower), where `D` is a block diagonal with `1x1` and `2x2` blocks chosen by the bounded Bunch-Kaufman ("rook") pivoting strategy.
-   Pivot indices in `IPIV` follow the stdlib bitwise-NOT convention: a `1x1` pivot stores a non-negative `0`-based row index; a `2x2` pivot stores `~p` (bitwise NOT of the `0`-based row index) for both rows of the block.
-   For Hermitian matrices, the diagonal entries are real; the imaginary parts are explicitly zeroed by the routine.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );
var zlahefRook = require( '@stdlib/lapack/base/zlahef_rook' );

var A = new Complex128Array([
    4, 0,  1, 0.5,  2, -1,  0.5, 0.1,
    0, 0,  3, 0,  0.5, -0.2,  1, 0.3,
    0, 0,  0, 0,  5, 0,  0.2, -0.4,
    0, 0,  0, 0,  0, 0,  6, 0
]);
var IPIV = new Int32Array( 4 );
var W = new Complex128Array( 4 * 8 );

var result = zlahefRook( 'column-major', 'lower', 4, 8, A, 4, IPIV, W, 4 );
console.log( result );
console.log( IPIV );
```

</section>

<!-- /.examples -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[@stdlib/array/complex128]: https://github.com/stdlib-js/stdlib

[@stdlib/array/int32]: https://github.com/stdlib-js/stdlib

</section>

<!-- /.links -->
