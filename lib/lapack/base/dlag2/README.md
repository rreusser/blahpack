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

# dlag2

> Computes the eigenvalues of a 2-by-2 generalized eigenvalue problem `A - w B`, with scaling as necessary to avoid over-/underflow.

<section class="usage">

## Usage

```javascript
var dlag2 = require( '@stdlib/lapack/base/dlag2' );
```

#### dlag2( order, A, LDA, B, LDB, safmin, scale1, scale2, wr1, wr2, wi )

Computes the eigenvalues of a 2-by-2 generalized eigenvalue problem `A - w B`, with scaling as necessary to avoid over-/underflow.

```javascript
var dlag2 = require( '@stdlib/lapack/base/dlag2' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );

dlag2.ndarray( A, N, 1, 0, B, N, 1, 0, 1.0 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
-   **B**: input array `B`.
-   **LDB**: leading dimension of `B`.
-   **safmin**: `safmin`.

#### dlag2.ndarray( A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, safmin, scale1, scale2, wr1, wr2, wi )

Computes the eigenvalues of a 2-by-2 generalized eigenvalue problem `A - w B`, with scaling as necessary to avoid over-/underflow, using alternative indexing semantics.

```javascript
var dlag2 = require( '@stdlib/lapack/base/dlag2' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );

dlag2.ndarray( A, N, 1, 0, B, N, 1, 0, 1.0 );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **strideB1**: stride of dimension 1 of `B`.
-   **strideB2**: stride of dimension 2 of `B`.
-   **offsetB**: starting index for `B`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dlag2()` corresponds to the [LAPACK][lapack] level routine [`dlag2`][lapack-dlag2].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dlag2 = require( '@stdlib/lapack/base/dlag2' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );

dlag2.ndarray( A, N, 1, 0, B, N, 1, 0, 1.0 );
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

[lapack-dlag2]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dlag2.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->