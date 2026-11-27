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

# dtgexc

> Reorders the generalized real Schur decomposition of a real matrix pair (A,B) using an orthogonal equivalence transformation (A, B) = Q·(A, B)·Zᵀ, so that the diagonal block of (A, B) with row index IFST is moved to row ILST

<section class="usage">

## Usage

```javascript
var dtgexc = require( '@stdlib/lapack/base/dtgexc' );
```

#### dtgexc( order, wantq, wantz, N, A, LDA, B, LDB, Q, LDQ, Z, LDZ, ifst, ilst, WORK, strideWORK, lwork )

Reorders the generalized real Schur decomposition of a real matrix pair (A,B) using an orthogonal equivalence transformation (A, B) = Q·(A, B)·Zᵀ, so that the diagonal block of (A, B) with row index IFST is moved to row ILST

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var A = new Float64Array( [ 1.0, 0.5, 0.3, 0.0, 2.0, 0.4, 0.0, 0.0, 3.0 ] );
var B = new Float64Array( [ 1.0, 0.2, 0.1, 0.0, 1.5, 0.3, 0.0, 0.0, 2.0 ] );
var Q = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ] );
var Z = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ] );
var WORK = new Float64Array( 28 );

var out = dtgexc( 'row-major', true, true, 3, A, 3, B, 3, Q, 3, Z, 3, 0, 2, WORK, 1, 28 );
// out.info => 0
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **wantq**: boolean indicating whether to update the matrix Q.
-   **wantz**: boolean indicating whether to update the matrix Z.
-   **N**: order of the matrices A and B.
-   **A**: upper quasi-triangular matrix.
-   **LDA**: leading dimension of `A`.
-   **B**: upper triangular matrix.
-   **LDB**: leading dimension of `B`.
-   **Q**: orthogonal matrix (updated if wantq is true).
-   **LDQ**: leading dimension of `Q`.
-   **Z**: orthogonal matrix (updated if wantz is true).
-   **LDZ**: leading dimension of `Z`.
-   **ifst**: row index of the block to move (0-based).
-   **ilst**: target row index (0-based).
-   **WORK**: workspace array.
-   **strideWORK**: stride length for `WORK`.
-   **lwork**: length of the workspace array.

#### dtgexc.ndarray( wantq, wantz, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, ifst, ilst, WORK, strideWORK, offsetWORK, lwork )

Reorders the generalized real Schur decomposition of a real matrix pair (A,B) using an orthogonal equivalence transformation (A, B) = Q·(A, B)·Zᵀ, so that the diagonal block of (A, B) with row index IFST is moved to row ILST, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var A = new Float64Array( [ 1.0, 0.0, 0.0, 0.5, 2.0, 0.0, 0.3, 0.4, 3.0 ] );
var B = new Float64Array( [ 1.0, 0.0, 0.0, 0.2, 1.5, 0.0, 0.1, 0.3, 2.0 ] );
var Q = new Float64Array( 9 );
var Z = new Float64Array( 9 );
var WORK = new Float64Array( 28 );

var out = dtgexc.ndarray( false, false, 3, A, 1, 3, 0, B, 1, 3, 0, Q, 1, 3, 0, Z, 1, 3, 0, 0, 2, WORK, 1, 0, 28 );
// out.info => 0
```

The function has the following additional parameters:

-   **wantq**: boolean indicating whether to update the matrix Q.
-   **wantz**: boolean indicating whether to update the matrix Z.
-   **N**: order of the matrices A and B.
-   **A**: input matrix.
-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **B**: input matrix.
-   **strideB1**: stride of dimension 1 of `B`.
-   **strideB2**: stride of dimension 2 of `B`.
-   **offsetB**: starting index for `B`.
-   **Q**: input matrix.
-   **strideQ1**: stride of dimension 1 of `Q`.
-   **strideQ2**: stride of dimension 2 of `Q`.
-   **offsetQ**: starting index for `Q`.
-   **Z**: input matrix.
-   **strideZ1**: stride of dimension 1 of `Z`.
-   **strideZ2**: stride of dimension 2 of `Z`.
-   **offsetZ**: starting index for `Z`.
-   **ifst**: row index of the block to move (0-based).
-   **ilst**: target row index (0-based).
-   **WORK**: workspace array.
-   **strideWORK**: stride length for `WORK`.
-   **offsetWORK**: starting index for `WORK`.
-   **lwork**: length of the workspace array.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   The routine moves a diagonal block of the generalized real Schur form from position `ifst` to position `ilst`. Both `ifst` and `ilst` are 0-based indices and may be adjusted on return if they point to the second row of a 2-by-2 block.
-   The workspace array `WORK` should have length at least `4*N + 16`.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dtgexc = require( '@stdlib/lapack/base/dtgexc' );

// 3x3 upper triangular matrices in column-major order:
var A = new Float64Array( [ 1.0, 0.0, 0.0, 0.5, 2.0, 0.0, 0.3, 0.4, 3.0 ] );
var B = new Float64Array( [ 1.0, 0.0, 0.0, 0.2, 1.5, 0.0, 0.1, 0.3, 2.0 ] );
var Q = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ] );
var Z = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ] );
var WORK = new Float64Array( 28 );

// Move the eigenvalue at position 0 to position 2:
var out = dtgexc( 'column-major', true, true, 3, A, 3, B, 3, Q, 3, Z, 3, 0, 2, WORK, 1, 28 );

console.log( 'info:', out.info );
// => 0

console.log( 'A:', A );
console.log( 'B:', B );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/dtgexc.f; do not edit) -->

<section class="fortran-docs">

## Reference documentation

From the reference LAPACK 3.12.0 source of `DTGEXC`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

### Purpose

DTGEXC reorders the generalized real Schur decomposition of a real matrix pair (A,B) using an orthogonal equivalence transformation

$$
(A, B) = Q \, (A, B) \, Z^T
$$

so that the diagonal block of (A, B) with row index `IFST` is moved to row `ILST`.

(A, B) must be in generalized real Schur canonical form (as returned by DGGES), i.e. A is block upper triangular with 1-by-1 and 2-by-2 diagonal blocks. B is upper triangular.

Optionally, the matrices Q and Z of generalized Schur vectors are updated.

`Q(in)` \* `A(in)` \* `Z(in)`\*\*T = `Q(out)` \* `A(out)` \* `Z(out)`\*\*T `Q(in)` \* `B(in)` \* `Z(in)`\*\*T = `Q(out)` \* `B(out)` \* `Z(out)`\*\*T

### Arguments

#### WANTQ `[in]`

_LOGICAL_

.TRUE. : update the left transformation matrix Q; .FALSE.: do not update Q.

#### WANTZ `[in]`

_LOGICAL_

.TRUE. : update the right transformation matrix Z; .FALSE.: do not update Z.

#### N `[in]`

_INTEGER_

The order of the matrices A and B. $N \ge 0$.

#### A `[in,out]`

_DOUBLE PRECISION array, dimension (LDA,N)_

On entry, the matrix A in generalized real Schur canonical form. On exit, the updated matrix A, again in generalized real Schur canonical form.

#### LDA `[in]`

_INTEGER_

The leading dimension of the array A. $\mathrm{LDA} \ge \max (1,N)$.

#### B `[in,out]`

_DOUBLE PRECISION array, dimension (LDB,N)_

On entry, the matrix B in generalized real Schur canonical form (A,B). On exit, the updated matrix B, again in generalized real Schur canonical form (A,B).

#### LDB `[in]`

_INTEGER_

The leading dimension of the array B. $\mathrm{LDB} \ge \max (1,N)$.

#### Q `[in,out]`

_DOUBLE PRECISION array, dimension (LDQ,N)_

On entry, if `WANTQ` = .TRUE., the orthogonal matrix Q. On exit, the updated matrix Q. If `WANTQ` = .FALSE., Q is not referenced.

#### LDQ `[in]`

_INTEGER_

The leading dimension of the array Q. $\mathrm{LDQ} \ge 1$. If `WANTQ` = .TRUE., $\mathrm{LDQ} \ge N$.

#### Z `[in,out]`

_DOUBLE PRECISION array, dimension (LDZ,N)_

On entry, if `WANTZ` = .TRUE., the orthogonal matrix Z. On exit, the updated matrix Z. If `WANTZ` = .FALSE., Z is not referenced.

#### LDZ `[in]`

_INTEGER_

The leading dimension of the array Z. $\mathrm{LDZ} \ge 1$. If `WANTZ` = .TRUE., $\mathrm{LDZ} \ge N$.

#### IFST `[in,out]`

_INTEGER_

#### ILST `[in,out]`

_INTEGER_

Specify the reordering of the diagonal blocks of (A, B). The block with row index `IFST` is moved to row `ILST`, by a sequence of swapping between adjacent blocks. On exit, if `IFST` pointed on entry to the second row of a 2-by-2 block, it is changed to point to the first row; `ILST` always points to the first row of the block in its final position (which may differ from its input value by +1 or -1). $1 \le \mathrm{IFST}$, $\mathrm{ILST} \le N$.

#### WORK `[out]`

_DOUBLE PRECISION array, dimension (MAX(1,LWORK))_

On exit, if `INFO = 0`, `WORK(1)` returns the optimal `LWORK`.

#### LWORK `[in]`

_INTEGER_

The dimension of the array `WORK`. $\mathrm{LWORK} \ge 1$ when $N \le 1$, otherwise $\mathrm{LWORK} \ge 4 \, N + 16$.

If `LWORK = -1`, then a workspace query is assumed; the routine only calculates the optimal size of the `WORK` array, returns this value as the first entry of the `WORK` array, and no error message related to `LWORK` is issued by XERBLA.

#### INFO `[out]`

_INTEGER_

-   `=0`: successful exit.
-   `<0`: if `INFO = -i`, the i-th argument had an illegal value.
-   `=1`: The transformed matrix pair (A, B) would be too far from generalized Schur form; the problem is ill- conditioned. (A, B) may have been partially reordered, and `ILST` points to the first row of the current position of the block being moved.

### References

\[1\] B. Kagstrom; A Direct Method for Reordering Eigenvalues in the

-   Generalized Real Schur Form of a Regular Matrix Pair (A, B), in
-   M.S. Moonen et al (eds), Linear Algebra for Large Scale and
-   Real-Time Applications, Kluwer Academic Publ. 1993, pp 195-218.

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
