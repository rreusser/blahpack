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

# dsytrf_rk

> Compute the bounded Bunch-Kaufman (rook) factorization of a real symmetric indefinite matrix in `_rk` storage format (blocked algorithm).

<section class="intro">

`dsytrfRk` factors

```text
A = P*U*D*(U^T)*(P^T)   or   A = P*L*D*(L^T)*(P^T)
```

where `U` (or `L`) is unit upper (lower) triangular, `P` is a permutation matrix, and `D` is symmetric and block diagonal with 1x1 and 2x2 blocks. The diagonal of `D` is stored on the diagonal of `A`; the off-diagonal entries of the 2x2 blocks are returned in the auxiliary vector `e`.

</section>

<!-- /.intro -->

<section class="usage">

## Usage

```javascript
var dsytrfRk = require( '@stdlib/lapack/base/dsytrf_rk' );
```

#### dsytrfRk( order, uplo, N, A, LDA, e, strideE, IPIV, strideIPIV )

Computes the `_rk` Bunch-Kaufman (rook) factorization of a real symmetric indefinite matrix.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );

var A = new Float64Array( [ 4, 2, 1, 0, 0, 5, 2, 1, 0, 0, 6, 3, 0, 0, 0, 8 ] );
var e = new Float64Array( 4 );
var IPIV = new Int32Array( 4 );

dsytrfRk( 'column-major', 'lower', 4, A, 4, e, 1, IPIV, 1 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **uplo**: which triangle of `A` is referenced (`'upper'` or `'lower'`).
-   **N**: order of the matrix `A`.
-   **A**: input/output symmetric matrix ([`Float64Array`][mdn-float64array]). On exit, contains the factorization.
-   **LDA**: leading dimension of `A`.
-   **e**: output vector ([`Float64Array`][mdn-float64array]) of length `N` containing the off-diagonal entries of `D`. Entries corresponding to 1x1 pivot blocks are set to `0`.
-   **strideE**: stride for `e`.
-   **IPIV**: output pivot index array ([`Int32Array`][mdn-int32array]) of length `N`. Entries are 0-based; 2x2 pivot rows are encoded as `~p` (bitwise NOT of the 0-based row index).
-   **strideIPIV**: stride for `IPIV`.

The function returns an `info` integer: `0` on success, `k > 0` (1-based) if `D(k,k)` is exactly zero (the factorization is completed but `D` is singular).

#### dsytrfRk.ndarray( uplo, N, A, strideA1, strideA2, offsetA, e, strideE, offsetE, IPIV, strideIPIV, offsetIPIV )

Same operation, with full ndarray (stride/offset) semantics for every array argument.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );

var A = new Float64Array( [ 4, 2, 1, 0, 0, 5, 2, 1, 0, 0, 6, 3, 0, 0, 0, 8 ] );
var e = new Float64Array( 4 );
var IPIV = new Int32Array( 4 );

dsytrfRk.ndarray( 'lower', 4, A, 1, 4, 0, e, 1, 0, IPIV, 1, 0 );
```

The additional parameters relative to the BLAS-style API are:

-   **strideA1**: stride along the first dimension of `A`.
-   **strideA2**: stride along the second dimension of `A`.
-   **offsetA**: starting index for `A`.
-   **offsetE**: starting index for `e`.
-   **offsetIPIV**: starting index for `IPIV`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   The implementation is a blocked driver: it calls `dlasyf_rk` for full panels of width `NB` (64, from `ilaenv`) and falls back to the unblocked kernel `dsytf2_rk` for the trailing submatrix.
-   `IPIV` follows the stdlib bitwise-NOT convention: positive entries indicate a 1x1 pivot whose target row is the value itself; negative entries `~p` indicate a 2x2 pivot block whose swap target is `~IPIV[i]`.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var dsytrfRk = require( '@stdlib/lapack/base/dsytrf_rk' );

var A = new Float64Array( [ 4, 2, 1, 0, 0, 5, 2, 1, 0, 0, 6, 3, 0, 0, 0, 8 ] );
var e = new Float64Array( 4 );
var IPIV = new Int32Array( 4 );

var info = dsytrfRk( 'column-major', 'lower', 4, A, 4, e, 1, IPIV, 1 );
console.log( info );
console.log( A );
console.log( e );
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

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array
[mdn-int32array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int32Array

</section>

<!-- /.links -->
