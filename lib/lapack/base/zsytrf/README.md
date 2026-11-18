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

# zsytrf

> Compute the factorization of a complex symmetric matrix using Bunch-Kaufman diagonal pivoting.

<section class="usage">

## Usage

```javascript
var zsytrf = require( '@stdlib/lapack/base/zsytrf' );
```

#### zsytrf( order, uplo, N, A, LDA, IPIV, strideIPIV, WORK )

Compute the factorization of a complex symmetric matrix using Bunch-Kaufman diagonal pivoting.

```javascript
var zsytrf = require( '@stdlib/lapack/base/zsytrf' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var IPIV = discreteUniform( N, -10, 10, opts );

zsytrf.ndarray( 'upper', N, A, N, 1, 0, IPIV, 1, 0 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **uplo**: specifies whether the upper or lower triangle of `A` is stored (`'upper'` or `'lower'`).
-   **N**: order of the matrix `A`.
-   **A**: input/output matrix `A`; overwritten with the block diagonal factor and multipliers.
-   **LDA**: leading dimension of `A`.
-   **IPIV**: output pivot indices.
-   **strideIPIV**: stride length for `IPIV`.
-   **WORK**: workspace (length >= 1; `N*32` enables the blocked algorithm); if `null`, a workspace is allocated internally.

#### zsytrf.ndarray( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV )

Compute the factorization of a complex symmetric matrix using Bunch-Kaufman diagonal pivoting, using alternative indexing semantics.

```javascript
var zsytrf = require( '@stdlib/lapack/base/zsytrf' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var IPIV = discreteUniform( N, -10, 10, opts );

zsytrf.ndarray( 'upper', N, A, N, 1, 0, IPIV, 1, 0 );
```

The function has the following additional parameters:


</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zsytrf()` corresponds to the [LAPACK][lapack] level routine [`zsytrf`][lapack-zsytrf].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var zsytrf = require( '@stdlib/lapack/base/zsytrf' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var IPIV = discreteUniform( N, -10, 10, opts );

zsytrf.ndarray( 'upper', N, A, N, 1, 0, IPIV, 1, 0 );
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

[lapack-zsytrf]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zsytrf.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->