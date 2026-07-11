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

# zpbtf2

> Computes the Cholesky factorization of a symmetric/Hermitian positive definite band matrix (unblocked algorithm).

<section class="usage">

## Usage

```javascript
var zpbtf2 = require( '@stdlib/lapack/base/zpbtf2' );
```

#### zpbtf2( order, uplo, N, kd, AB, LDAB )

Computes the Cholesky factorization of a symmetric/Hermitian positive definite band matrix (unblocked algorithm).

```javascript
var zpbtf2 = require( '@stdlib/lapack/base/zpbtf2' );

var N = 3;
var AB = discreteUniform( N * N, -10, 10, opts );

zpbtf2.ndarray( 'upper', N, 1, AB, N, 1, 0 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **uplo**: specifies whether the upper or lower triangular part is referenced.
-   **N**: number of columns.
-   **kd**: `kd`.
-   **AB**: input array `AB`.
-   **LDAB**: leading dimension of `AB`.

#### zpbtf2.ndarray( uplo, N, kd, AB, strideAB1, strideAB2, offsetAB )

Computes the Cholesky factorization of a symmetric/Hermitian positive definite band matrix (unblocked algorithm), using alternative indexing semantics.

```javascript
var zpbtf2 = require( '@stdlib/lapack/base/zpbtf2' );

var N = 3;
var AB = discreteUniform( N * N, -10, 10, opts );

zpbtf2.ndarray( 'upper', N, 1, AB, N, 1, 0 );
```

The function has the following additional parameters:

-   **strideAB1**: stride of dimension 1 of `AB`.
-   **strideAB2**: stride of dimension 2 of `AB`.
-   **offsetAB**: starting index for `AB`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zpbtf2()` corresponds to the [LAPACK][lapack] level routine [`zpbtf2`][lapack-zpbtf2].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var zpbtf2 = require( '@stdlib/lapack/base/zpbtf2' );

var N = 3;
var AB = discreteUniform( N * N, -10, 10, opts );

zpbtf2.ndarray( 'upper', N, 1, AB, N, 1, 0 );
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

[lapack-zpbtf2]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zpbtf2.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->