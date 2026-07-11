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

# dsygv

> Computes all the eigenvalues, and optionally, the eigenvectors of a real generalized symmetric-definite eigenproblem, of the form A·x=λ·B·x, A·Bx=λ·x, or B·A·x=λ·x.

<section class="usage">

## Usage

```javascript
var dsygv = require( '@stdlib/lapack/base/dsygv' );
```

#### dsygv( itype, jobz, uplo, N, A, LDA, B, LDB, w, strideW, WORK, strideWORK, lwork )

Computes all the eigenvalues, and optionally, the eigenvectors of a real generalized symmetric-definite eigenproblem, of the form A·x=λ·B·x, A·Bx=λ·x, or B·A·x=λ·x.

```javascript
var dsygv = require( '@stdlib/lapack/base/dsygv' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var w = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

dsygv.ndarray( N, 'compute-vectors', 'upper', N, A, N, 1, 0, B, N, 1, 0, w, 1, 0, WORK, 1, 0, N );
```

The function has the following parameters:

-   **itype**: `itype`.
-   **jobz**: `jobz`.
-   **uplo**: specifies whether the upper or lower triangular part is referenced.
-   **N**: number of columns.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
-   **B**: input array `B`.
-   **LDB**: leading dimension of `B`.
-   **w**: `w`.
-   **strideW**: stride length for `W`.
-   **WORK**: input array `WORK`.
-   **strideWORK**: stride length for `WORK`.
-   **lwork**: `lwork`.

#### dsygv.ndarray( itype, jobz, uplo, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, w, strideW, offsetW, WORK, strideWORK, offsetWORK, lwork )

Computes all the eigenvalues, and optionally, the eigenvectors of a real generalized symmetric-definite eigenproblem, of the form A·x=λ·B·x, A·Bx=λ·x, or B·A·x=λ·x, using alternative indexing semantics.

```javascript
var dsygv = require( '@stdlib/lapack/base/dsygv' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var w = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

dsygv.ndarray( N, 'compute-vectors', 'upper', N, A, N, 1, 0, B, N, 1, 0, w, 1, 0, WORK, 1, 0, N );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **strideB1**: stride of dimension 1 of `B`.
-   **strideB2**: stride of dimension 2 of `B`.
-   **offsetB**: starting index for `B`.
-   **offsetW**: starting index for `W`.
-   **offsetWORK**: starting index for `WORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dsygv()` corresponds to the [LAPACK][lapack] level routine [`dsygv`][lapack-dsygv].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dsygv = require( '@stdlib/lapack/base/dsygv' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var w = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

dsygv.ndarray( N, 'compute-vectors', 'upper', N, A, N, 1, 0, B, N, 1, 0, w, 1, 0, WORK, 1, 0, N );
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

[lapack-dsygv]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dsygv.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->