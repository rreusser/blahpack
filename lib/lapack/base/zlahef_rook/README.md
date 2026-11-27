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

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/zlahef_rook.f; do not edit) -->

<section class="fortran-docs">

## Reference documentation

From the reference LAPACK 3.12.0 source of `ZLAHEF_ROOK`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

### Purpose

ZLAHEF\_ROOK computes a partial factorization of a complex Hermitian matrix A using the bounded Bunch-Kaufman ("rook") diagonal pivoting method. The partial factorization has the form:

$$
A = \begin{pmatrix} I & U_{12} \\ 0 & U_{22} \end{pmatrix} \begin{pmatrix} A_{11} & 0 \\ 0 & D \end{pmatrix} \begin{pmatrix} I & 0 \\ U_{12}^H & U_{22}^H \end{pmatrix} \quad\text{if}\quad \mathrm{UPLO} = \text{'U'}, \quad\text{or}\quad
$$

$A = ( L_{11} 0 )$ ( D 0 ) $( L_{11}^H L_{21}^H )$ if `UPLO = 'L'`

( L21 I ) ( 0 A22 ) ( 0 I )

where the order of D is at most `NB`. The actual order is returned in the argument `KB`, and is either `NB` or `NB`-1, or N if $N \le \mathrm{NB}$. Note that $U^H$ denotes the conjugate transpose of U.

ZLAHEF\_ROOK is an auxiliary routine called by ZHETRF\_ROOK. It uses blocked code (calling Level 3 BLAS) to update the submatrix A11 (if `UPLO = 'U'`) or A22 (if `UPLO = 'L'`).

### Arguments

#### UPLO `[in]`

_CHARACTER\*1_

Specifies whether the upper or lower triangular part of the Hermitian matrix A is stored:

-   `= 'U'`: Upper triangular
-   `= 'L'`: Lower triangular

#### N `[in]`

_INTEGER_

The order of the matrix A. $N \ge 0$.

#### NB `[in]`

_INTEGER_

The maximum number of columns of the matrix A that should be factored. `NB` should be at least 2 to allow for 2-by-2 pivot blocks.

#### KB `[out]`

_INTEGER_

The number of columns of A that were actually factored. `KB` is either `NB`-1 or `NB`, or N if $N \le \mathrm{NB}$.

#### A `[in,out]`

_COMPLEX\*16 array, dimension (LDA,N)_

On entry, the Hermitian matrix A. If `UPLO = 'U'`, the leading n-by-n upper triangular part of A contains the upper triangular part of the matrix A, and the strictly lower triangular part of A is not referenced. If `UPLO = 'L'`, the leading n-by-n lower triangular part of A contains the lower triangular part of the matrix A, and the strictly upper triangular part of A is not referenced. On exit, A contains details of the partial factorization.

#### LDA `[in]`

_INTEGER_

The leading dimension of the array A. $\mathrm{LDA} \ge \max (1,N)$.

#### IPIV `[out]`

_INTEGER array, dimension (N)_

Details of the interchanges and the block structure of D.

If `UPLO = 'U'`:

Only the last `KB` elements of `IPIV` are set.

If $\mathrm{IPIV}(k) > 0$, then rows and columns k and `IPIV(k)` were interchanged and D(k,k) is a 1-by-1 diagonal block.

If $\mathrm{IPIV}(k) < 0$ and $\mathrm{IPIV}(k-1) < 0$, then rows and columns k and -`IPIV(k)` were interchanged and rows and columns k-1 and -`IPIV(k-1)` were inerchaged, D(k-1:k,k-1:k) is a 2-by-2 diagonal block.

If `UPLO = 'L'`:

Only the first `KB` elements of `IPIV` are set.

If $\mathrm{IPIV}(k) > 0$, then rows and columns k and `IPIV(k)` were interchanged and D(k,k) is a 1-by-1 diagonal block.

If $\mathrm{IPIV}(k) < 0$ and $\mathrm{IPIV}(k+1) < 0$, then rows and columns k and -`IPIV(k)` were interchanged and rows and columns k+1 and -`IPIV(k+1)` were inerchaged, D(k:k+1,k:k+1) is a 2-by-2 diagonal block.

#### W `[out]`

_COMPLEX\*16 array, dimension (LDW,NB)_

#### LDW `[in]`

_INTEGER_

The leading dimension of the array W. $\mathrm{LDW} \ge \max (1,N)$.

#### INFO `[out]`

_INTEGER_

-   `= 0`: successful exit
-   `> 0`: if `INFO = k`, D(k,k) is exactly zero.  The factorization has been completed, but the block diagonal matrix D is exactly singular.

### Contributors

November 2013, Igor Kozachenko,

-   Computer Science Division,
-   University of California, Berkeley

September 2007, Sven Hammarling, Nicholas J. Higham, Craig Lucas,

-   School of Mathematics,
-   University of Manchester

</section>

<!-- fortran-docs:end -->

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
