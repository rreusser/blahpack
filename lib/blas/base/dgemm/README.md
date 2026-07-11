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

# dgemm

> Performs one of the matrix-matrix operations C := α·op(A)·op(B) + β·C.

<section class="usage">

## Usage

```javascript
var dgemm = require( '@stdlib/blas/base/dgemm' );
```

#### dgemm( order, transa, transb, M, N, K, alpha, A, LDA, B, LDB, beta, C, LDC )

Performs one of the matrix-matrix operations C := α·op(A)·op(B) + β·C.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dgemm = require( '@stdlib/blas/base/dgemm' );

var A = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
var B = new Float64Array( [ 5.0, 6.0, 7.0, 8.0 ] );
var C = new Float64Array( [ 0.0, 0.0, 0.0, 0.0 ] );

dgemm.ndarray( 'no-transpose', 'no-transpose', 2, 2, 2, 1.0, A, 2, 1, 0, B, 2, 1, 0, 0.0, C, 2, 1, 0 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **transa**: specifies the operation for matrix `A`.
-   **transb**: specifies the operation for matrix `B`.
-   **M**: number of rows.
-   **N**: number of columns.
-   **K**: inner dimension.
-   **alpha**: scalar constant.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
-   **B**: input array `B`.
-   **LDB**: leading dimension of `B`.
-   **beta**: scalar constant.
-   **C**: input array `C`.
-   **LDC**: leading dimension of `C`.

#### dgemm.ndarray( transa, transb, M, N, K, alpha, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, beta, C, strideC1, strideC2, offsetC )

Performs one of the matrix-matrix operations C := α·op(A)·op(B) + β·C, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dgemm = require( '@stdlib/blas/base/dgemm' );

var A = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
var B = new Float64Array( [ 5.0, 6.0, 7.0, 8.0 ] );
var C = new Float64Array( [ 0.0, 0.0, 0.0, 0.0 ] );

dgemm.ndarray( 'no-transpose', 'no-transpose', 2, 2, 2, 1.0, A, 2, 1, 0, B, 2, 1, 0, 0.0, C, 2, 1, 0 );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **strideB1**: stride of dimension 1 of `B`.
-   **strideB2**: stride of dimension 2 of `B`.
-   **offsetB**: starting index for `B`.
-   **strideC1**: stride of dimension 1 of `C`.
-   **strideC2**: stride of dimension 2 of `C`.
-   **offsetC**: starting index for `C`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dgemm()` corresponds to the [LAPACK][lapack] level routine [`dgemm`][lapack-dgemm].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dgemm = require( '@stdlib/blas/base/dgemm' );

var A = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
var B = new Float64Array( [ 5.0, 6.0, 7.0, 8.0 ] );
var C = new Float64Array( [ 0.0, 0.0, 0.0, 0.0 ] );

dgemm.ndarray( 'no-transpose', 'no-transpose', 2, 2, 2, 1.0, A, 2, 1, 0, B, 2, 1, 0, 0.0, C, 2, 1, 0 );
```

</section>

<!-- /.examples -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[lapack]: https://www.netlib.org/lapack/explore-html/

[lapack-dgemm]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dgemm.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->