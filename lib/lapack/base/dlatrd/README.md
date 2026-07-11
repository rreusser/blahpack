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

# dlatrd

> Reduces the first nb rows and columns of a symmetric/Hermitian matrix A to real tridiagonal form by an orthogonal similarity transformation.

<section class="usage">

## Usage

```javascript
var dlatrd = require( '@stdlib/lapack/base/dlatrd' );
```

#### dlatrd( order, uplo, N, nb, A, LDA, e, strideE, TAU, strideTAU, W, LDW )

Reduces the first nb rows and columns of a symmetric/Hermitian matrix A to real tridiagonal form by an orthogonal similarity transformation.

```javascript
var dlatrd = require( '@stdlib/lapack/base/dlatrd' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var W = discreteUniform( N * N, -10, 10, opts );
var e = discreteUniform( N, -10, 10, opts );
var TAU = discreteUniform( N, -10, 10, opts );

dlatrd.ndarray( 'upper', N, N, A, N, 1, 0, e, 1, 0, TAU, 1, 0, W, N, 1, 0 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **uplo**: specifies whether the upper or lower triangular part is referenced.
-   **N**: number of columns.
-   **nb**: `nb`.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
-   **e**: `e`.
-   **strideE**: stride length for `E`.
-   **TAU**: input array `TAU`.
-   **strideTAU**: stride length for `TAU`.
-   **W**: input array `W`.
-   **LDW**: leading dimension of `W`.

#### dlatrd.ndarray( uplo, N, nb, A, strideA1, strideA2, offsetA, e, strideE, offsetE, TAU, strideTAU, offsetTAU, W, strideW1, strideW2, offsetW )

Reduces the first nb rows and columns of a symmetric/Hermitian matrix A to real tridiagonal form by an orthogonal similarity transformation, using alternative indexing semantics.

```javascript
var dlatrd = require( '@stdlib/lapack/base/dlatrd' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var W = discreteUniform( N * N, -10, 10, opts );
var e = discreteUniform( N, -10, 10, opts );
var TAU = discreteUniform( N, -10, 10, opts );

dlatrd.ndarray( 'upper', N, N, A, N, 1, 0, e, 1, 0, TAU, 1, 0, W, N, 1, 0 );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **offsetE**: starting index for `E`.
-   **offsetTAU**: starting index for `TAU`.
-   **strideW1**: stride of dimension 1 of `W`.
-   **strideW2**: stride of dimension 2 of `W`.
-   **offsetW**: starting index for `W`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dlatrd()` corresponds to the [LAPACK][lapack] level routine [`dlatrd`][lapack-dlatrd].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dlatrd = require( '@stdlib/lapack/base/dlatrd' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var W = discreteUniform( N * N, -10, 10, opts );
var e = discreteUniform( N, -10, 10, opts );
var TAU = discreteUniform( N, -10, 10, opts );

dlatrd.ndarray( 'upper', N, N, A, N, 1, 0, e, 1, 0, TAU, 1, 0, W, N, 1, 0 );
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

[lapack-dlatrd]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dlatrd.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->