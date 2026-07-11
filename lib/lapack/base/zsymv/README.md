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

# zsymv

> Computes a matrix-vector product for a complex symmetric matrix.

<section class="usage">

## Usage

```javascript
var zsymv = require( '@stdlib/lapack/base/zsymv' );
```

#### zsymv( uplo, N, alpha, A, LDA, x, strideX, beta, y, strideY )

Computes a matrix-vector product for a complex symmetric matrix.

```javascript
var zsymv = require( '@stdlib/lapack/base/zsymv' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var x = discreteUniform( N, -10, 10, opts );
var y = discreteUniform( N, -10, 10, opts );

zsymv.ndarray( 'upper', N, 1.0, A, N, 1, 0, x, 1, 0, 1.0, y, 1, 0 );
```

The function has the following parameters:

-   **uplo**: specifies whether the upper or lower triangular part is referenced.
-   **N**: number of columns.
-   **alpha**: scalar constant.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
-   **x**: `x`.
-   **strideX**: stride length for `X`.
-   **beta**: scalar constant.
-   **y**: `y`.
-   **strideY**: stride length for `Y`.

#### zsymv.ndarray( uplo, N, alpha, A, strideA1, strideA2, offsetA, x, strideX, offsetX, beta, y, strideY, offsetY )

Computes a matrix-vector product for a complex symmetric matrix, using alternative indexing semantics.

```javascript
var zsymv = require( '@stdlib/lapack/base/zsymv' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var x = discreteUniform( N, -10, 10, opts );
var y = discreteUniform( N, -10, 10, opts );

zsymv.ndarray( 'upper', N, 1.0, A, N, 1, 0, x, 1, 0, 1.0, y, 1, 0 );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **offsetX**: starting index for `X`.
-   **offsetY**: starting index for `Y`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zsymv()` corresponds to the [LAPACK][lapack] level routine [`zsymv`][lapack-zsymv].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var zsymv = require( '@stdlib/lapack/base/zsymv' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var x = discreteUniform( N, -10, 10, opts );
var y = discreteUniform( N, -10, 10, opts );

zsymv.ndarray( 'upper', N, 1.0, A, N, 1, 0, x, 1, 0, 1.0, y, 1, 0 );
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

[lapack-zsymv]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zsymv.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->