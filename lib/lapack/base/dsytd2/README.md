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

# dsytd2

> Reduces a symmetric matrix to real symmetric tridiagonal form by an orthogonal similarity transformation (unblocked algorithm).

<section class="usage">

## Usage

```javascript
var dsytd2 = require( '@stdlib/lapack/base/dsytd2' );
```

#### dsytd2( order, uplo, N, A, LDA, d, strideD, e, strideE, TAU, strideTAU )

Reduces a symmetric matrix to real symmetric tridiagonal form by an orthogonal similarity transformation (unblocked algorithm).

```javascript
var dsytd2 = require( '@stdlib/lapack/base/dsytd2' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var e = discreteUniform( N, -10, 10, opts );
var TAU = discreteUniform( N, -10, 10, opts );

dsytd2.ndarray( 'upper', N, A, N, 1, 0, d, 1, 0, e, 1, 0, TAU, 1, 0 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **uplo**: specifies whether the upper or lower triangular part is referenced.
-   **N**: number of columns.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
-   **d**: `d`.
-   **strideD**: stride length for `D`.
-   **e**: `e`.
-   **strideE**: stride length for `E`.
-   **TAU**: input array `TAU`.
-   **strideTAU**: stride length for `TAU`.

#### dsytd2.ndarray( uplo, N, A, strideA1, strideA2, offsetA, d, strideD, offsetD, e, strideE, offsetE, TAU, strideTAU, offsetTAU )

Reduces a symmetric matrix to real symmetric tridiagonal form by an orthogonal similarity transformation (unblocked algorithm), using alternative indexing semantics.

```javascript
var dsytd2 = require( '@stdlib/lapack/base/dsytd2' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var e = discreteUniform( N, -10, 10, opts );
var TAU = discreteUniform( N, -10, 10, opts );

dsytd2.ndarray( 'upper', N, A, N, 1, 0, d, 1, 0, e, 1, 0, TAU, 1, 0 );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **offsetD**: starting index for `D`.
-   **offsetE**: starting index for `E`.
-   **offsetTAU**: starting index for `TAU`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dsytd2()` corresponds to the [LAPACK][lapack] level routine [`dsytd2`][lapack-dsytd2].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dsytd2 = require( '@stdlib/lapack/base/dsytd2' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var e = discreteUniform( N, -10, 10, opts );
var TAU = discreteUniform( N, -10, 10, opts );

dsytd2.ndarray( 'upper', N, A, N, 1, 0, d, 1, 0, e, 1, 0, TAU, 1, 0 );
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

[lapack-dsytd2]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dsytd2.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->