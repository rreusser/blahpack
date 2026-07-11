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

# zhecon

> Estimates the reciprocal of the condition number of a complex Hermitian matrix A using the factorization A = U·D·Uᴴ or A = L·D·Lᴴ computed by ZHETRF.

<section class="usage">

## Usage

```javascript
var zhecon = require( '@stdlib/lapack/base/zhecon' );
```

#### zhecon( uplo, N, A, LDA, IPIV, strideIPIV, anorm, rcond, WORK, strideWORK )

Estimates the reciprocal of the condition number of a complex Hermitian matrix A using the factorization A = U·D·Uᴴ or A = L·D·Lᴴ computed by ZHETRF.

```javascript
var zhecon = require( '@stdlib/lapack/base/zhecon' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var IPIV = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

zhecon.ndarray( 'upper', N, A, N, 1, 0, IPIV, 1, 0, 1.0, 1.0, WORK, 1, 0 );
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

#### zhecon.ndarray( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, anorm, rcond, WORK, strideWORK, offsetWORK )

Estimates the reciprocal of the condition number of a complex Hermitian matrix A using the factorization A = U·D·Uᴴ or A = L·D·Lᴴ computed by ZHETRF, using alternative indexing semantics.

```javascript
var zhecon = require( '@stdlib/lapack/base/zhecon' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var IPIV = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

zhecon.ndarray( 'upper', N, A, N, 1, 0, IPIV, 1, 0, 1.0, 1.0, WORK, 1, 0 );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **offsetIPIV**: starting index for `IPIV`.
-   **offsetWORK**: starting index for `WORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zhecon()` corresponds to the [LAPACK][lapack] level routine [`zhecon`][lapack-zhecon].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var zhecon = require( '@stdlib/lapack/base/zhecon' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var IPIV = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

zhecon.ndarray( 'upper', N, A, N, 1, 0, IPIV, 1, 0, 1.0, 1.0, WORK, 1, 0 );
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

[lapack-zhecon]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zhecon.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->