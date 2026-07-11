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

# dsycon

> Estimates the reciprocal of the condition number (in the 1-norm) of a real symmetric matrix A using the factorization A = U·D·Uᵀ or A = L·D·Lᵀ computed by DSYTRF.

<section class="usage">

## Usage

```javascript
var dsycon = require( '@stdlib/lapack/base/dsycon' );
```

#### dsycon( uplo, N, A, LDA, IPIV, strideIPIV, anorm, rcond, WORK, strideWORK, IWORK, strideIWORK )

Estimates the reciprocal of the condition number (in the 1-norm) of a real symmetric matrix A using the factorization A = U·D·Uᵀ or A = L·D·Lᵀ computed by DSYTRF.

```javascript
var dsycon = require( '@stdlib/lapack/base/dsycon' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var IPIV = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );

dsycon.ndarray( 'upper', N, A, N, 1, 0, IPIV, 1, 0, 1.0, 1.0, WORK, 1, 0, IWORK, 1, 0 );
```

The function has the following parameters:

-   **uplo**: specifies whether the upper or lower triangular part is referenced.
-   **N**: number of columns.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
-   **IPIV**: input array `IPIV`.
-   **strideIPIV**: stride length for `IPIV`.
-   **anorm**: `anorm`.
-   **rcond**: `rcond`.
-   **WORK**: input array `WORK`.
-   **strideWORK**: stride length for `WORK`.
-   **IWORK**: input array `IWORK`.
-   **strideIWORK**: stride length for `IWORK`.

#### dsycon.ndarray( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, anorm, rcond, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK )

Estimates the reciprocal of the condition number (in the 1-norm) of a real symmetric matrix A using the factorization A = U·D·Uᵀ or A = L·D·Lᵀ computed by DSYTRF, using alternative indexing semantics.

```javascript
var dsycon = require( '@stdlib/lapack/base/dsycon' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var IPIV = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );

dsycon.ndarray( 'upper', N, A, N, 1, 0, IPIV, 1, 0, 1.0, 1.0, WORK, 1, 0, IWORK, 1, 0 );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **offsetIPIV**: starting index for `IPIV`.
-   **offsetWORK**: starting index for `WORK`.
-   **offsetIWORK**: starting index for `IWORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dsycon()` corresponds to the [LAPACK][lapack] level routine [`dsycon`][lapack-dsycon].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dsycon = require( '@stdlib/lapack/base/dsycon' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var IPIV = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );

dsycon.ndarray( 'upper', N, A, N, 1, 0, IPIV, 1, 0, 1.0, 1.0, WORK, 1, 0, IWORK, 1, 0 );
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

[lapack-dsycon]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dsycon.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->