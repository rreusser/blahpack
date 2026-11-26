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

# dsytri2

> Compute the inverse of a real symmetric indefinite matrix using the factorization produced by `dsytrf` (dispatches between `dsytri` and `dsytri2x`).

<section class="usage">

## Usage

```javascript
var dsytri2 = require( '@stdlib/lapack/base/dsytri2' );
```

#### dsytri2( order, uplo, N, A, LDA, IPIV, strideIPIV, WORK )

Compute the inverse of a real symmetric indefinite matrix.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );

var A = new Float64Array( [ 5.0 ] );
var IPIV = new Int32Array( [ 0 ] );

dsytri2( 'column-major', 'lower', 1, A, 1, IPIV, 1, null );
// A => <Float64Array>[ 0.2 ]
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **uplo**: `'upper'` or `'lower'`. Must match the factorization.
-   **N**: order of the matrix `A`.
-   **A**: input/output matrix; on entry, the factored form from `dsytrf`; on exit, the symmetric inverse.
-   **LDA**: leading dimension of `A`.
-   **IPIV**: pivot indices from `dsytrf`.
-   **strideIPIV**: stride length for `IPIV`.
-   **WORK**: workspace of length at least `max(1,N)` when `N <= NBMAX`, else `(N+NBMAX+1)*(NBMAX+3)`, where `NBMAX = ILAENV( 1, 'DSYTRI2', ... ) = 1`; if `null`, a workspace is allocated internally.

#### dsytri2.ndarray( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, WORK, strideWORK, offsetWORK )

Compute the inverse using alternative indexing semantics and a caller-supplied workspace.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );

var A = new Float64Array( [ 5.0 ] );
var IPIV = new Int32Array( [ 0 ] );
var WORK = new Float64Array( 1 );

dsytri2.ndarray( 'lower', 1, A, 1, 1, 0, IPIV, 1, 0, WORK, 1, 0 );
// A => <Float64Array>[ 0.2 ]
```

The function has the following additional parameters:

-   **strideA1**: stride of the first dimension of `A`.
-   **strideA2**: stride of the second dimension of `A`.
-   **offsetA**: starting index for `A`.
-   **strideIPIV**: stride length for `IPIV`.
-   **offsetIPIV**: starting index for `IPIV`.
-   **WORK**: workspace; see notes below for sizing.
-   **strideWORK**: stride length for `WORK`.
-   **offsetWORK**: starting index for `WORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   The routine dispatches at the reference's block size `NBMAX = ILAENV( 1, 'DSYTRI2', ... )`, which is `1` (ILAENV has no `SY`/`TRI` entry), so every `N > 1` takes the blocked path with `NB = 1`. When `N <= NBMAX`, the unblocked worker `dsytri` is invoked and `WORK` must hold at least `N` elements. When `N > NBMAX`, the blocked worker `dsytri2x` is invoked and `WORK` must hold at least `(N+NBMAX+1)*(NBMAX+3)` elements arranged column-major with leading dimension `N+NBMAX+1`.
-   The BLAS-style wrapper `dsytri2( order, uplo, N, A, LDA, IPIV, strideIPIV, WORK )` allocates `WORK` internally when `WORK` is `null`, with the correct size for the dispatch path it will take.
-   `IPIV` follows the JS convention used throughout the Bunch-Kaufman family: non-negative entries denote `1x1` pivot blocks (target row index `0`-based); negative entries `raw` denote `2x2` pivot blocks with target `~raw` (bitwise NOT).
-   Returns `0` on success; a positive integer `k` indicates that `D[k,k] = 0` and the inverse could not be computed.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var dsytri2 = require( '@stdlib/lapack/base/dsytri2' );

var A = new Float64Array( [ 5.0 ] );
var IPIV = new Int32Array( [ 0 ] );

var info = dsytri2( 'column-major', 'lower', 1, A, 1, IPIV, 1, null );
console.log( info );
console.log( A[ 0 ] );
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
