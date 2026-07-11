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

# zpotri

> Computes the inverse of a complex Hermitian positive definite matrix A using the Cholesky factorization A = Uᴴ·U or A = L·Lᴴ computed by ZPOTRF.

<section class="usage">

## Usage

```javascript
var zpotri = require( '@stdlib/lapack/base/zpotri' );
```

#### zpotri( order, uplo, N, A, LDA )

Computes the inverse of a complex Hermitian positive definite matrix A using the Cholesky factorization A = Uᴴ·U or A = L·Lᴴ computed by ZPOTRF.

```javascript
var zpotri = require( '@stdlib/lapack/base/zpotri' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );

zpotri.ndarray( 'upper', N, A, N, 1, 0 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **uplo**: specifies whether the upper or lower triangular part is referenced.
-   **N**: number of columns.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.

#### zpotri.ndarray( uplo, N, A, strideA1, strideA2, offsetA )

Computes the inverse of a complex Hermitian positive definite matrix A using the Cholesky factorization A = Uᴴ·U or A = L·Lᴴ computed by ZPOTRF, using alternative indexing semantics.

```javascript
var zpotri = require( '@stdlib/lapack/base/zpotri' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );

zpotri.ndarray( 'upper', N, A, N, 1, 0 );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zpotri()` corresponds to the [LAPACK][lapack] level routine [`zpotri`][lapack-zpotri].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var zpotri = require( '@stdlib/lapack/base/zpotri' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );

zpotri.ndarray( 'upper', N, A, N, 1, 0 );
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

[lapack-zpotri]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zpotri.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->