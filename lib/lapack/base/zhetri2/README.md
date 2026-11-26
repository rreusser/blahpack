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

# zhetri2

> Computes the inverse of a complex Hermitian indefinite matrix `A` using the factorization `A = U*D*U**H` or `A = L*D*L**H` produced by [`zhetrf`][@stdlib/lapack/base/zhetrf] (classic Bunch-Kaufman). Dispatches between [`zhetri`][@stdlib/lapack/base/zhetri] (unblocked) and [`zhetri2x`][@stdlib/lapack/base/zhetri2x] (blocked) based on `N` versus the internal block size.

<section class="usage">

## Usage

```javascript
var zhetri2 = require( '@stdlib/lapack/base/zhetri2' );
```

#### zhetri2( order, uplo, N, A, LDA, IPIV, strideIPIV, offsetIPIV, WORK, strideWORK )

Computes the inverse of a complex Hermitian indefinite matrix `A`.

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );

var A = new Complex128Array( [ 4.0, 0.0 ] );
var IPIV = new Int32Array( [ 0 ] );
var WORK = new Complex128Array( 1 );

var info = zhetri2( 'column-major', 'lower', 1, A, 1, IPIV, 1, 0, WORK, 1 );
// returns 0
// A is now [ 0.25 + 0i ]
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **uplo**: specifies whether the upper or lower triangle of `A` is referenced (`'upper'` or `'lower'`). Must match the factorization.
-   **N**: order of the matrix `A`.
-   **A**: input/output [`Complex128Array`][@stdlib/array/complex128] containing the factored form of `A` from `zhetrf` on entry; the inverse on successful exit.
-   **LDA**: leading dimension of `A`. Must satisfy `LDA >= max(1, N)`.
-   **IPIV**: pivot indices from `zhetrf` (Int32Array). Non-negative entries are zero-based row indices for `1x1` pivot blocks; negative entries encode `2x2` pivot blocks via bitwise NOT (`~p`).
-   **strideIPIV**: stride length for `IPIV`.
-   **offsetIPIV**: starting index for `IPIV`.
-   **WORK**: workspace [`Complex128Array`][@stdlib/array/complex128]. Must be at least `N` complex elements when the unblocked path is used, and at least `(N+nb+1) * (nb+3)` complex elements when the blocked path is used (where `nb` is the internal block size).
-   **strideWORK**: row stride for `WORK` (in complex elements).

Returns an integer `info` value: `0` on success; `info > 0` indicates that `D(info, info) = 0` and the matrix is singular.

#### zhetri2.ndarray( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, WORK, strideWORK, offsetWORK )

Same computation using strided/offset semantics (ndarray-style).

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );

var A = new Complex128Array( [ 4.0, 0.0 ] );
var IPIV = new Int32Array( [ 0 ] );
var WORK = new Complex128Array( 1 );

var info = zhetri2.ndarray( 'lower', 1, A, 1, 1, 0, IPIV, 1, 0, WORK, 1, 0 );
// returns 0
```

The function has the following additional parameters:

-   **strideA1**: stride of the first dimension of `A` (in complex elements).
-   **strideA2**: stride of the second dimension of `A` (in complex elements).
-   **offsetA**: starting index for `A` (in complex elements).
-   **offsetWORK**: starting index for `WORK` (in complex elements).

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zhetri2` is a thin dispatcher: when `N` is at most the internal block size, it calls [`zhetri`][@stdlib/lapack/base/zhetri] (the unblocked variant, which only requires `WORK` of length `N`). When `N` exceeds the block size, it calls [`zhetri2x`][@stdlib/lapack/base/zhetri2x] (the blocked variant, which uses a larger workspace to leverage BLAS-3 GEMM/TRMM updates).
-   The block size is the reference's `NBMAX = ILAENV( 1, 'ZHETRF', ... )` (64): `N <= 64` dispatches to `zhetri` (`WORK` of `N` complex elements), larger `N` to `zhetri2x` (`WORK` of `(N+NBMAX+1)*(NBMAX+3)` complex elements). The workspace-query path (`LWORK = -1`) is not exposed.
-   On entry, `A` must contain the Bunch-Kaufman factorization of a Hermitian matrix as produced by [`zhetrf`][@stdlib/lapack/base/zhetrf].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Int32Array = require( '@stdlib/array/int32' );
var zhetri2 = require( '@stdlib/lapack/base/zhetri2' );

var A = new Complex128Array( [ 0.5, 0.0 ] );
var IPIV = new Int32Array( [ 0 ] );
var WORK = new Complex128Array( 1 );

var info = zhetri2( 'column-major', 'lower', 1, A, 1, IPIV, 1, 0, WORK, 1 );
console.log( 'info = ' + info );
console.log( 'inv(A)[0,0] = ' + A.get( 0 ).re + ' + ' + A.get( 0 ).im + 'i' );
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

[@stdlib/lapack/base/zhetrf]: https://github.com/stdlib-js/stdlib

[@stdlib/lapack/base/zhetri]: https://github.com/stdlib-js/stdlib

[@stdlib/lapack/base/zhetri2x]: https://github.com/stdlib-js/stdlib

</section>

<!-- /.links -->
