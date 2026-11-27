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

# zheev

> Computes the eigenvalues and, optionally, the left and/or right eigenvectors for Hermitian matrices.

<section class="usage">

## Usage

```javascript
var zheev = require( '@stdlib/lapack/base/zheev' );
```

#### zheev( order, jobz, uplo, N, A, LDA, w, strideW, WORK, strideWORK, lwork, RWORK, strideRWORK )

Computes the eigenvalues and, optionally, the left and/or right eigenvectors for Hermitian matrices.

```javascript
var zheev = require( '@stdlib/lapack/base/zheev' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var w = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var RWORK = discreteUniform( N, -10, 10, opts );

zheev.ndarray( 'compute', 'upper', N, A, N, 1, 0, w, 1, 0, WORK, 1, 0, N, RWORK, 1, 0 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **jobz**: `jobz`.
-   **uplo**: specifies whether the upper or lower triangular part is referenced.
-   **N**: number of columns.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
-   **w**: `w`.
-   **strideW**: stride length for `W`.
-   **WORK**: input array `WORK`.
-   **strideWORK**: stride length for `WORK`.
-   **lwork**: `lwork`.
-   **RWORK**: input array `RWORK`.
-   **strideRWORK**: stride length for `RWORK`.

#### zheev.ndarray( jobz, uplo, N, A, strideA1, strideA2, offsetA, w, strideW, offsetW, WORK, strideWORK, offsetWORK, lwork, RWORK, strideRWORK, offsetRWORK )

Computes the eigenvalues and, optionally, the left and/or right eigenvectors for Hermitian matrices, using alternative indexing semantics.

```javascript
var zheev = require( '@stdlib/lapack/base/zheev' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var w = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var RWORK = discreteUniform( N, -10, 10, opts );

zheev.ndarray( 'compute', 'upper', N, A, N, 1, 0, w, 1, 0, WORK, 1, 0, N, RWORK, 1, 0 );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **offsetW**: starting index for `W`.
-   **offsetWORK**: starting index for `WORK`.
-   **offsetRWORK**: starting index for `RWORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zheev()` corresponds to the [LAPACK][lapack] level routine [`zheev`][lapack-zheev].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var zheev = require( '@stdlib/lapack/base/zheev' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var w = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var RWORK = discreteUniform( N, -10, 10, opts );

zheev.ndarray( 'compute', 'upper', N, A, N, 1, 0, w, 1, 0, WORK, 1, 0, N, RWORK, 1, 0 );
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

[lapack-zheev]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zheev.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->