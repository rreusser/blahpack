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

# zsytrs

> Perform complex division, storing result in module-level cdR and cdI.

<section class="usage">

## Usage

```javascript
var zsytrs = require( '@stdlib/lapack/base/zsytrs' );
```

#### zsytrs( order, uplo, N, nrhs, A, LDA, IPIV, strideIPIV, B, LDB )

Perform complex division, storing result in module-level cdR and cdI.

```javascript
var zsytrs = require( '@stdlib/lapack/base/zsytrs' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var IPIV = discreteUniform( N, -10, 10, opts );

zsytrs.ndarray( 'upper', N, N, A, N, 1, 0, IPIV, 1, 0, B, N, 1, 0 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **uplo**: specifies whether the upper or lower triangle was factored (`'upper'` or `'lower'`).
-   **N**: order of the matrix `A`.
-   **nrhs**: number of right-hand sides.
-   **A**: factored matrix from `zsytrf`.
-   **LDA**: leading dimension of `A`.
-   **IPIV**: pivot indices from `zsytrf`.
-   **strideIPIV**: stride length for `IPIV`.
-   **B**: right-hand side matrix; overwritten with the solution.
-   **LDB**: leading dimension of `B`.

#### zsytrs.ndarray( uplo, N, nrhs, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB )

Perform complex division, storing result in module-level cdR and cdI, using alternative indexing semantics.

```javascript
var zsytrs = require( '@stdlib/lapack/base/zsytrs' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var IPIV = discreteUniform( N, -10, 10, opts );

zsytrs.ndarray( 'upper', N, N, A, N, 1, 0, IPIV, 1, 0, B, N, 1, 0 );
```

The function has the following additional parameters:


</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zsytrs()` corresponds to the [LAPACK][lapack] level routine [`zsytrs`][lapack-zsytrs].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var zsytrs = require( '@stdlib/lapack/base/zsytrs' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var IPIV = discreteUniform( N, -10, 10, opts );

zsytrs.ndarray( 'upper', N, N, A, N, 1, 0, IPIV, 1, 0, B, N, 1, 0 );
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

[lapack-zsytrs]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zsytrs.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->