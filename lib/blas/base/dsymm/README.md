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

# dsymm

> Performs one of the matrix-matrix operations C := α·A·B + β·C, or C := α·B·A + β·C.

<section class="usage">

## Usage

```javascript
var dsymm = require( '@stdlib/blas/base/dsymm' );
```

#### dsymm( order, side, uplo, M, N, alpha, A, LDA, B, LDB, beta, C, LDC )

Performs one of the matrix-matrix operations C := α·A·B + β·C, or C := α·B·A + β·C.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dsymm = require( '@stdlib/blas/base/dsymm' );

var A = new Float64Array( [ 1.0, 2.0, 2.0, 3.0 ] );
var B = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
var C = new Float64Array( [ 0.0, 0.0, 0.0, 0.0 ] );

dsymm.ndarray( 'left', 'upper', 2, 2, 1.0, A, 2, 1, 0, B, 2, 1, 0, 0.0, C, 2, 1, 0 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **side**: specifies the side of the operation.
-   **uplo**: specifies whether the upper or lower triangular part is referenced.
-   **M**: number of rows.
-   **N**: number of columns.
-   **alpha**: scalar constant.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
-   **B**: input array `B`.
-   **LDB**: leading dimension of `B`.
-   **beta**: scalar constant.
-   **C**: input array `C`.
-   **LDC**: leading dimension of `C`.

#### dsymm.ndarray( side, uplo, M, N, alpha, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, beta, C, strideC1, strideC2, offsetC )

Performs one of the matrix-matrix operations C := α·A·B + β·C, or C := α·B·A + β·C, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dsymm = require( '@stdlib/blas/base/dsymm' );

var A = new Float64Array( [ 1.0, 2.0, 2.0, 3.0 ] );
var B = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
var C = new Float64Array( [ 0.0, 0.0, 0.0, 0.0 ] );

dsymm.ndarray( 'left', 'upper', 2, 2, 1.0, A, 2, 1, 0, B, 2, 1, 0, 0.0, C, 2, 1, 0 );
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

-   `dsymm()` corresponds to the [LAPACK][lapack] level routine [`dsymm`][lapack-dsymm].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dsymm = require( '@stdlib/blas/base/dsymm' );

var A = new Float64Array( [ 1.0, 2.0, 2.0, 3.0 ] );
var B = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
var C = new Float64Array( [ 0.0, 0.0, 0.0, 0.0 ] );

dsymm.ndarray( 'left', 'upper', 2, 2, 1.0, A, 2, 1, 0, B, 2, 1, 0, 0.0, C, 2, 1, 0 );
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

[lapack-dsymm]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dsymm.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->