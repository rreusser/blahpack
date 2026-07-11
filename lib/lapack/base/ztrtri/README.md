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

# ztrtri

> Computes the inverse of a complex upper or lower triangular matrix A.

<section class="usage">

## Usage

```javascript
var ztrtri = require( '@stdlib/lapack/base/ztrtri' );
```

#### ztrtri( order, uplo, diag, N, A, LDA )

Computes the inverse of a complex upper or lower triangular matrix A.

```javascript
var ztrtri = require( '@stdlib/lapack/base/ztrtri' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );

ztrtri.ndarray( 'upper', 'non-unit', N, A, N, 1, 0 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **uplo**: specifies whether the upper or lower triangular part is referenced.
-   **diag**: specifies whether the matrix is unit triangular.
-   **N**: number of columns.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.

#### ztrtri.ndarray( uplo, diag, N, A, strideA1, strideA2, offsetA )

Computes the inverse of a complex upper or lower triangular matrix A, using alternative indexing semantics.

```javascript
var ztrtri = require( '@stdlib/lapack/base/ztrtri' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );

ztrtri.ndarray( 'upper', 'non-unit', N, A, N, 1, 0 );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `ztrtri()` corresponds to the [LAPACK][lapack] level routine [`ztrtri`][lapack-ztrtri].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var ztrtri = require( '@stdlib/lapack/base/ztrtri' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );

ztrtri.ndarray( 'upper', 'non-unit', N, A, N, 1, 0 );
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

[lapack-ztrtri]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__ztrtri.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->