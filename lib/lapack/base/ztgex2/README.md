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

# ztgex2

> Swap adjacent diagonal 1-by-1 blocks in an upper triangular matrix pair (A, B) by a unitary equivalence transformation.

<section class="usage">

## Usage

```javascript
var ztgex2 = require( '@stdlib/lapack/base/ztgex2' );
```

#### ztgex2( order, wantq, wantz, N, A, LDA, B, LDB, Q, LDQ, Z, LDZ, j1 )

Swaps adjacent diagonal 1-by-1 blocks in an upper triangular matrix pair (A, B).

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );

var A = new Complex128Array( [ 1.0, 0.5, 0.0, 0.0, 0.3, 0.1, 2.0, -0.3 ] );
var B = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.2, -0.1, 0.5, 0.2 ] );
var Q = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
var Z = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );

var info = ztgex2( 'column-major', true, true, 2, A, 2, B, 2, Q, 2, Z, 2, 0 );
// info => 0
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **wantq**: whether to update the left transformation matrix Q.
-   **wantz**: whether to update the right transformation matrix Z.
-   **N**: order of the matrices A and B.
-   **A**: upper triangular matrix A (`Complex128Array`).
-   **LDA**: leading dimension of `A`.
-   **B**: upper triangular matrix B (`Complex128Array`).
-   **LDB**: leading dimension of `B`.
-   **Q**: left transformation matrix (`Complex128Array`).
-   **LDQ**: leading dimension of `Q`.
-   **Z**: right transformation matrix (`Complex128Array`).
-   **LDZ**: leading dimension of `Z`.
-   **j1**: index of the first block to swap (0-based).

#### ztgex2.ndarray( wantq, wantz, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, j1 )

Swaps adjacent diagonal 1-by-1 blocks using alternative indexing semantics.

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );

var A = new Complex128Array( [ 1.0, 0.5, 0.0, 0.0, 0.3, 0.1, 2.0, -0.3 ] );
var B = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.2, -0.1, 0.5, 0.2 ] );
var Q = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
var Z = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );

var info = ztgex2.ndarray( true, true, 2, A, 1, 2, 0, B, 1, 2, 0, Q, 1, 2, 0, Z, 1, 2, 0, 0 );
// info => 0
```

The function has the following additional parameters:

-   **strideA1**: stride of the first dimension of `A` (complex elements).
-   **strideA2**: stride of the second dimension of `A` (complex elements).
-   **offsetA**: starting index for `A` (complex elements).
-   **strideB1**: stride of the first dimension of `B` (complex elements).
-   **strideB2**: stride of the second dimension of `B` (complex elements).
-   **offsetB**: starting index for `B` (complex elements).
-   **strideQ1**: stride of the first dimension of `Q` (complex elements).
-   **strideQ2**: stride of the second dimension of `Q` (complex elements).
-   **offsetQ**: starting index for `Q` (complex elements).
-   **strideZ1**: stride of the first dimension of `Z` (complex elements).
-   **strideZ2**: stride of the second dimension of `Z` (complex elements).
-   **offsetZ**: starting index for `Z` (complex elements).

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `ztgex2` is the complex version of `dtgex2`. Since complex triangular matrices have only 1-by-1 blocks (no 2-by-2 blocks as in the real case), this routine is simpler.
-   The routine computes unitary matrices Q and Z such that `Q' * A * Z` and `Q' * B * Z` have their diagonal blocks swapped.
-   Returns 0 on success, 1 if the swap was rejected (the blocks are too close to being degenerate).

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var reinterpret = require( '@stdlib/strided/base/reinterpret-complex128' );
var ztgex2 = require( '@stdlib/lapack/base/ztgex2' );

// 2x2 upper triangular pair in column-major order:
var A = new Complex128Array( [ 1.0, 0.5, 0.0, 0.0, 0.3, 0.1, 2.0, -0.3 ] );
var B = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.2, -0.1, 0.5, 0.2 ] );
var Q = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
var Z = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );

// Swap the two diagonal blocks:
var info = ztgex2( 'column-major', true, true, 2, A, 2, B, 2, Q, 2, Z, 2, 0 );

console.log( 'info:', info );
console.log( 'A:', Array.from( reinterpret( A, 0 ) ) );
console.log( 'B:', Array.from( reinterpret( B, 0 ) ) );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/ztgex2.f; do not edit) -->

<section class="fortran-docs">

## Reference documentation

From the reference LAPACK 3.12.0 source of `ZTGEX2`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

> Swaps adjacent diagonal blocks in an upper (quasi) triangular matrix pair by an unitary equivalence transformation.

### Purpose

ZTGEX2 swaps adjacent diagonal 1 by 1 blocks (A11,B11) and (A22,B22) in an upper triangular matrix pair (A, B) by an unitary equivalence transformation.

(A, B) must be in generalized Schur canonical form, that is, A and B are both upper triangular.

Optionally, the matrices Q and Z of generalized Schur vectors are updated.

`Q(in)` \* `A(in)` \* `Z(in)`\*\*H = `Q(out)` \* `A(out)` \* `Z(out)`\*\*H `Q(in)` \* `B(in)` \* `Z(in)`\*\*H = `Q(out)` \* `B(out)` \* `Z(out)`\*\*H

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

_COMPLEX\*16 array, dimensions (LDA,N)_

On entry, the matrix A in the pair (A, B). On exit, the updated matrix A.

#### LDA `[in]`

_INTEGER_

The leading dimension of the array A. $\mathrm{LDA} \ge \max (1,N)$.

#### B `[in,out]`

_COMPLEX\*16 array, dimensions (LDB,N)_

On entry, the matrix B in the pair (A, B). On exit, the updated matrix B.

#### LDB `[in]`

_INTEGER_

The leading dimension of the array B. $\mathrm{LDB} \ge \max (1,N)$.

#### Q `[in,out]`

_COMPLEX\*16 array, dimension (LDQ,N)_

If `WANTQ` = .TRUE, on entry, the unitary matrix Q. On exit, the updated matrix Q. Not referenced if `WANTQ` = .FALSE..

#### LDQ `[in]`

_INTEGER_

The leading dimension of the array Q. $\mathrm{LDQ} \ge 1$; If `WANTQ` = .TRUE., $\mathrm{LDQ} \ge N$.

#### Z `[in,out]`

_COMPLEX\*16 array, dimension (LDZ,N)_

If `WANTZ` = .TRUE, on entry, the unitary matrix Z. On exit, the updated matrix Z. Not referenced if `WANTZ` = .FALSE..

#### LDZ `[in]`

_INTEGER_

The leading dimension of the array Z. $\mathrm{LDZ} \ge 1$; If `WANTZ` = .TRUE., $\mathrm{LDZ} \ge N$.

#### J1 `[in]`

_INTEGER_

The index to the first block (A11, B11).

#### INFO `[out]`

_INTEGER_

-   `=0`: Successful exit.
-   `=1`: The transformed matrix pair (A, B) would be too far from generalized Schur form; the problem is ill- conditioned.

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

</section>

<!-- /.links -->
