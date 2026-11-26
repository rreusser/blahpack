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

# zsytrf_rk

> Compute the bounded Bunch-Kaufman (rook) factorization of a complex symmetric indefinite matrix in `_rk` storage format (blocked algorithm).

<section class="intro">

`zsytrfRk` factors

```text
A = P*U*D*(U^T)*(P^T)   or   A = P*L*D*(L^T)*(P^T)
```

where `U` (or `L`) is unit upper (lower) triangular, `P` is a permutation matrix, and `D` is complex symmetric and block diagonal with 1x1 and 2x2 blocks. The diagonal of `D` is stored on the diagonal of `A`; the off-diagonal entries of the 2x2 blocks are returned in the auxiliary vector `e`.

</section>

<!-- /.intro -->

<section class="usage">

## Usage

```javascript
var zsytrfRk = require( '@stdlib/lapack/base/zsytrf_rk' );
```

#### zsytrfRk( order, uplo, N, A, LDA, e, strideE, IPIV, strideIPIV )

Computes the `_rk` Bunch-Kaufman (rook) factorization of a complex symmetric indefinite matrix.

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );

var A = new Complex128Array( [ 4, 0.5, 1, 2, 0, 0, 5, -0.5, 0, 0, 0, 0, 7, 1, 0, 0, 0, 0, 0, 0, 0, 0, 6, -1, 0, 0, 0, 0, 0, 0, 0, 0 ] );
var e = new Complex128Array( 4 );
var IPIV = new Int32Array( 4 );

zsytrfRk( 'column-major', 'lower', 4, A, 4, e, 1, IPIV, 1 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **uplo**: which triangle of `A` is referenced (`'upper'` or `'lower'`).
-   **N**: order of the matrix `A`.
-   **A**: input/output complex symmetric matrix ([`Complex128Array`][@stdlib/array/complex128]). On exit, contains the factorization.
-   **LDA**: leading dimension of `A`.
-   **e**: output vector ([`Complex128Array`][@stdlib/array/complex128]) of length `N` containing the off-diagonal entries of `D`. Entries corresponding to 1x1 pivot blocks are set to `0`.
-   **strideE**: stride for `e` (in complex elements).
-   **IPIV**: output pivot index array ([`Int32Array`][mdn-int32array]) of length `N`. Entries are 0-based; 2x2 pivot rows are encoded as `~p` (bitwise NOT of the 0-based row index).
-   **strideIPIV**: stride for `IPIV`.

The function returns an `info` integer: `0` on success, `k > 0` (1-based) if `D(k,k)` is exactly zero (the factorization is completed but `D` is singular).

#### zsytrfRk.ndarray( uplo, N, A, strideA1, strideA2, offsetA, e, strideE, offsetE, IPIV, strideIPIV, offsetIPIV )

Same operation, with full ndarray (stride/offset) semantics for every array argument.

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );

var A = new Complex128Array( [ 4, 0.5, 1, 2, 0, 0, 5, -0.5, 0, 0, 0, 0, 7, 1, 0, 0, 0, 0, 0, 0, 0, 0, 6, -1, 0, 0, 0, 0, 0, 0, 0, 0 ] );
var e = new Complex128Array( 4 );
var IPIV = new Int32Array( 4 );

zsytrfRk.ndarray( 'lower', 4, A, 1, 4, 0, e, 1, 0, IPIV, 1, 0 );
```

The additional parameters relative to the BLAS-style API are:

-   **strideA1**: stride along the first dimension of `A` (in complex elements).
-   **strideA2**: stride along the second dimension of `A` (in complex elements).
-   **offsetA**: starting index for `A` (in complex elements).
-   **offsetE**: starting index for `e` (in complex elements).
-   **offsetIPIV**: starting index for `IPIV`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   The implementation is a blocked driver: it calls `zlasyf_rk` for full panels of width `NB` (64, from `ilaenv`) and falls back to the unblocked kernel `zsytf2_rk` for the trailing submatrix.
-   `IPIV` follows the stdlib bitwise-NOT convention: positive entries indicate a 1x1 pivot whose target row is the value itself; negative entries `~p` indicate a 2x2 pivot block whose swap target is `~IPIV[i]`.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );
var zsytrfRk = require( '@stdlib/lapack/base/zsytrf_rk' );

var A = new Complex128Array( [ 4, 0.5, 1, 2, 0, 0, 5, -0.5, 0, 0, 0, 0, 7, 1, 0, 0, 0, 0, 0, 0, 0, 0, 6, -1, 0, 0, 0, 0, 0, 0, 0, 0 ] );
var e = new Complex128Array( 4 );
var IPIV = new Int32Array( 4 );

var info = zsytrfRk( 'column-major', 'lower', 4, A, 4, e, 1, IPIV, 1 );
console.log( info );
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

[@stdlib/array/complex128]: https://github.com/stdlib-js/array-complex128
[mdn-int32array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int32Array

</section>

<!-- /.links -->
