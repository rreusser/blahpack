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

# zlauu2

> Computes the product U·Uᴴ or Lᴴ·L, where U and L are upper or lower triangular matrices.

<section class="usage">

## Usage

```javascript
var zlauu2 = require( '@stdlib/lapack/base/zlauu2' );
```

#### zlauu2( order, uplo, N, A, LDA )

Computes the product U·Uᴴ or Lᴴ·L, where U and L are upper or lower triangular matrices.

```javascript
var zlauu2 = require( '@stdlib/lapack/base/zlauu2' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );

zlauu2.ndarray( 'upper', N, A, N, 1, 0 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **uplo**: specifies whether the upper or lower triangular part is referenced.
-   **N**: number of columns.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.

#### zlauu2.ndarray( uplo, N, A, strideA1, strideA2, offsetA )

Computes the product U·Uᴴ or Lᴴ·L, where U and L are upper or lower triangular matrices, using alternative indexing semantics.

```javascript
var zlauu2 = require( '@stdlib/lapack/base/zlauu2' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );

zlauu2.ndarray( 'upper', N, A, N, 1, 0 );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zlauu2()` corresponds to the [LAPACK][lapack] level routine [`zlauu2`][lapack-zlauu2].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var zlauu2 = require( '@stdlib/lapack/base/zlauu2' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );

zlauu2.ndarray( 'upper', N, A, N, 1, 0 );
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

[lapack-zlauu2]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zlauu2.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->