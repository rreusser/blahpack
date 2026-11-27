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

# zhetrf_rk

> Compute the bounded Bunch-Kaufman (rook) factorization of a complex Hermitian indefinite matrix in `_rk` storage format (blocked algorithm).

<section class="intro">

`zhetrfRk` factors

```text
A = P*U*D*(U^H)*(P^T)   or   A = P*L*D*(L^H)*(P^T)
```

where `U` (or `L`) is unit upper (lower) triangular, `P` is a permutation matrix, and `D` is Hermitian and block diagonal with 1x1 and 2x2 blocks. The diagonal of `D` is real-valued and stored on the diagonal of `A`; the off-diagonal entries of the 2x2 blocks are returned in the auxiliary vector `e`.

</section>

<!-- /.intro -->

<section class="usage">

## Usage

```javascript
var zhetrfRk = require( '@stdlib/lapack/base/zhetrf_rk' );
```

#### zhetrfRk( order, uplo, N, A, LDA, e, strideE, IPIV, strideIPIV )

Computes the `_rk` Bunch-Kaufman (rook) factorization of a complex Hermitian indefinite matrix.

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );

var A = new Complex128Array( [ 4, 0, 1, -2, 1, 2, 5, 0 ] );
var e = new Complex128Array( 2 );
var IPIV = new Int32Array( 2 );

zhetrfRk( 'column-major', 'lower', 2, A, 2, e, 1, IPIV, 1 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **uplo**: which triangle of `A` is referenced (`'upper'` or `'lower'`).
-   **N**: order of the matrix `A`.
-   **A**: input/output Hermitian matrix ([`Complex128Array`][@stdlib/array/complex128]). On exit, contains the factorization. Diagonal entries are forced to be real.
-   **LDA**: leading dimension of `A`.
-   **e**: output vector ([`Complex128Array`][@stdlib/array/complex128]) of length `N` containing the off-diagonal entries of `D`. Entries corresponding to 1x1 pivot blocks are set to `0`.
-   **strideE**: stride for `e`.
-   **IPIV**: output pivot index array ([`Int32Array`][mdn-int32array]) of length `N`. Entries are 0-based; 2x2 pivot rows are encoded as `~p` (bitwise NOT of the 0-based row index).
-   **strideIPIV**: stride for `IPIV`.

The function returns an `info` integer: `0` on success, `k > 0` (1-based) if `D(k,k)` is exactly zero (the factorization completes but `D` is singular).

#### zhetrfRk.ndarray( uplo, N, A, strideA1, strideA2, offsetA, e, strideE, offsetE, IPIV, strideIPIV, offsetIPIV )

Same operation, with full ndarray (stride/offset) semantics for every array argument.

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );

var A = new Complex128Array( [ 4, 0, 1, -2, 1, 2, 5, 0 ] );
var e = new Complex128Array( 2 );
var IPIV = new Int32Array( 2 );

zhetrfRk.ndarray( 'lower', 2, A, 1, 2, 0, e, 1, 0, IPIV, 1, 0 );
```

The additional parameters relative to the BLAS-style API are:

-   **strideA1**: stride along the first dimension of `A` (in complex elements).
-   **strideA2**: stride along the second dimension of `A` (in complex elements).
-   **offsetA**: starting complex-element index for `A`.
-   **offsetE**: starting complex-element index for `e`.
-   **offsetIPIV**: starting index for `IPIV`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   The implementation is a blocked driver: it calls `zlahef_rk` for full panels of width `NB` (64, from `ilaenv`) and falls back to the unblocked kernel `zhetf2_rk` for the trailing submatrix.
-   `IPIV` follows the stdlib bitwise-NOT convention: positive entries indicate a 1x1 pivot whose target row is the value itself; negative entries `~p` indicate a 2x2 pivot block whose swap target is `~IPIV[i]`.
-   For Hermitian matrices, the diagonal entries of `A` are real-valued; the imaginary parts on the diagonal are forced to zero on exit.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );
var zhetrfRk = require( '@stdlib/lapack/base/zhetrf_rk' );

var A = new Complex128Array( [
    4, 0, 1, -2, 3, 1, 0.5, -0.5,
    0, 0, 5, 0, 2, -1, 1, 2,
    0, 0, 0, 0, 7, 0, 3, 0,
    0, 0, 0, 0, 0, 0, 6, 0
] );
var e = new Complex128Array( 4 );
var IPIV = new Int32Array( 4 );

var info = zhetrfRk( 'column-major', 'lower', 4, A, 4, e, 1, IPIV, 1 );
console.log( info );
console.log( IPIV );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/zhetrf_rk.f; do not edit) -->

<section class="fortran-docs">

## Reference documentation

From the reference LAPACK 3.12.0 source of `ZHETRF_RK`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

> Computes the factorization of a complex Hermitian indefinite matrix using the bounded Bunch-Kaufman (rook) diagonal pivoting method (BLAS3 blocked algorithm).

### Purpose

ZHETRF\_RK computes the factorization of a complex Hermitian matrix A using the bounded Bunch-Kaufman (rook) diagonal pivoting method:

$$
A = P \, U \, D \, (U^H) \, (P^T) \quad\text{or}\quad A = P \, L \, D \, (L^H) \, (P^T)
$$

where U (or L) is unit upper (or lower) triangular matrix, $U^H$ (or $L^H$) is the conjugate of U (or L), P is a permutation matrix, $P^T$ is the transpose of P, and D is Hermitian and block diagonal with 1-by-1 and 2-by-2 diagonal blocks.

This is the blocked version of the algorithm, calling Level 3 BLAS. For more information see Further Details section.

### Arguments

#### UPLO `[in]`

_CHARACTER\*1_

Specifies whether the upper or lower triangular part of the Hermitian matrix A is stored:

-   `= 'U'`: Upper triangular
-   `= 'L'`: Lower triangular

#### N `[in]`

_INTEGER_

The order of the matrix A. $N \ge 0$.

#### A `[in,out]`

_COMPLEX\*16 array, dimension (LDA,N)_

On entry, the Hermitian matrix A.

-   If `UPLO = 'U'`: the leading N-by-N upper triangular part
-   of A contains the upper triangular part of the matrix A,
-   and the strictly lower triangular part of A is not
-   referenced.

If `UPLO = 'L'`: the leading N-by-N lower triangular part of A contains the lower triangular part of the matrix A, and the strictly upper triangular part of A is not referenced.

On exit, contains:

-   a) ONLY diagonal elements of the Hermitian block diagonal matrix D on the diagonal of A, i.e. $D(k,k) = A(k,k)$; (superdiagonal (or subdiagonal) elements of D are stored on exit in array E), and
-   b) If `UPLO = 'U'`: factor U in the superdiagonal part of A. If `UPLO = 'L'`: factor L in the subdiagonal part of A.

#### LDA `[in]`

_INTEGER_

The leading dimension of the array A. $\mathrm{LDA} \ge \max (1,N)$.

#### E `[out]`

_COMPLEX\*16 array, dimension (N)_

On exit, contains the superdiagonal (or subdiagonal) elements of the Hermitian block diagonal matrix D with 1-by-1 or 2-by-2 diagonal blocks, where If `UPLO = 'U'`: $E(i) = D(i-1,i)$, $i=2$:N, `E(1)` is set to 0; If `UPLO = 'L'`: $E(i) = D(i+1,i)$, $i=1$:N-1, `E(N)` is set to 0.

NOTE: For 1-by-1 diagonal block D(k), where $1 \le k \le N$, the element `E(k)` is set to 0 in both `UPLO = 'U'` or `UPLO = 'L'` cases.

#### IPIV `[out]`

_INTEGER array, dimension (N)_

`IPIV` describes the permutation matrix P in the factorization of matrix A as follows. The absolute value of `IPIV(k)` represents the index of row and column that were interchanged with the k-th row and column. The value of `UPLO` describes the order in which the interchanges were applied. Also, the sign of `IPIV` represents the block structure of the Hermitian block diagonal matrix D with 1-by-1 or 2-by-2 diagonal blocks which correspond to 1 or 2 interchanges at each factorization step. For more info see Further Details section.

If `UPLO = 'U'`, ( in factorization order, k decreases from N to 1 ):

a) A single positive entry $\mathrm{IPIV}(k) > 0$ means: D(k,k) is a 1-by-1 diagonal block. If $\mathrm{IPIV}(k) \ne k$, rows and columns k and `IPIV(k)` were interchanged in the matrix `A(1:N,1:N)`; If `IPIV(k) = k`, no interchange occurred.

b) A pair of consecutive negative entries

-   $\mathrm{IPIV}(k) < 0$ and $\mathrm{IPIV}(k-1) < 0$ means:
-   D(k-1:k,k-1:k) is a 2-by-2 diagonal block.
-   (NOTE: negative entries in `IPIV` appear ONLY in pairs).
-   1) If $-\mathrm{IPIV}(k) \ne k$, rows and columns k and -`IPIV(k)` were interchanged in the matrix `A(1:N,1:N)`. If `-IPIV(k) = k`, no interchange occurred.
-   2) If $-\mathrm{IPIV}(k-1) \ne k-1$, rows and columns k-1 and -`IPIV(k-1)` were interchanged in the matrix `A(1:N,1:N)`. If $-\mathrm{IPIV}(k-1) = k-1$, no interchange occurred.

c) In both cases a) and b), always $\lvert \mathrm{IPIV}(k) \rvert \le k$.

d) NOTE: Any entry `IPIV(k)` is always NONZERO on output.

If `UPLO = 'L'`, ( in factorization order, k increases from 1 to N ):

a) A single positive entry $\mathrm{IPIV}(k) > 0$ means: D(k,k) is a 1-by-1 diagonal block. If $\mathrm{IPIV}(k) \ne k$, rows and columns k and `IPIV(k)` were interchanged in the matrix `A(1:N,1:N)`. If `IPIV(k) = k`, no interchange occurred.

b) A pair of consecutive negative entries

-   $\mathrm{IPIV}(k) < 0$ and $\mathrm{IPIV}(k+1) < 0$ means:
-   D(k:k+1,k:k+1) is a 2-by-2 diagonal block.
-   (NOTE: negative entries in `IPIV` appear ONLY in pairs).
-   1) If $-\mathrm{IPIV}(k) \ne k$, rows and columns k and -`IPIV(k)` were interchanged in the matrix `A(1:N,1:N)`. If `-IPIV(k) = k`, no interchange occurred.
-   2) If $-\mathrm{IPIV}(k+1) \ne k+1$, rows and columns k-1 and -`IPIV(k-1)` were interchanged in the matrix `A(1:N,1:N)`. If $-\mathrm{IPIV}(k+1) = k+1$, no interchange occurred.

c) In both cases a) and b), always $\lvert \mathrm{IPIV}(k) \rvert \ge k$.

d) NOTE: Any entry `IPIV(k)` is always NONZERO on output.

#### WORK `[out]`

_COMPLEX\*16 array, dimension ( MAX(1,LWORK) )_

On exit, if `INFO = 0`, `WORK(1)` returns the optimal `LWORK`.

#### LWORK `[in]`

_INTEGER_

The length of `WORK`. $\mathrm{LWORK} \ge 1$. For best performance $\mathrm{LWORK} \ge N \, \mathrm{NB}$, where NB is the block size returned by ILAENV.

If `LWORK = -1`, then a workspace query is assumed; the routine only calculates the optimal size of the `WORK` array, returns this value as the first entry of the `WORK` array, and no error message related to `LWORK` is issued by XERBLA.

#### INFO `[out]`

_INTEGER_

-   `= 0`: successful exit

-   `< 0`: If `INFO = -k`, the k-th argument had an illegal value

-   `> 0`: If `INFO = k`, the matrix A is singular, because: If `UPLO = 'U'`: column k in the upper triangular part of A contains all zeros. If `UPLO = 'L'`: column k in the lower triangular part of A contains all zeros.

Therefore D(k,k) is exactly zero, and superdiagonal elements of column k of U (or subdiagonal elements of column k of L ) are all zeros. The factorization has been completed, but the block diagonal matrix D is exactly singular, and division by zero will occur if it is used to solve a system of equations.

NOTE: `INFO` only stores the first occurrence of a singularity, any subsequent occurrence of singularity is not stored in `INFO` even though the factorization always completes.

### Contributors

December 2016, Igor Kozachenko,

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

[@stdlib/array/complex128]: https://github.com/stdlib-js/array-complex128
[mdn-int32array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int32Array

</section>

<!-- /.links -->
