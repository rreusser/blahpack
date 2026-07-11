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

# dgels

> Solves overdetermined or underdetermined systems for general matrices.

<section class="usage">

## Usage

```javascript
var dgels = require( '@stdlib/lapack/base/dgels' );
```

#### dgels( order, trans, M, N, nrhs, A, LDA, B, LDB )

Solves overdetermined or underdetermined systems for general matrices.

```javascript
var dgels = require( '@stdlib/lapack/base/dgels' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );

dgels.ndarray( 'no-transpose', N, N, N, A, N, 1, 0, B, N, 1, 0 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **trans**: specifies whether the matrix should be transposed.
-   **M**: number of rows.
-   **N**: number of columns.
-   **nrhs**: number of right-hand sides.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
-   **B**: input array `B`.
-   **LDB**: leading dimension of `B`.

#### dgels.ndarray( trans, M, N, nrhs, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB )

Solves overdetermined or underdetermined systems for general matrices, using alternative indexing semantics.

```javascript
var dgels = require( '@stdlib/lapack/base/dgels' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );

dgels.ndarray( 'no-transpose', N, N, N, A, N, 1, 0, B, N, 1, 0 );
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

-   `dgels()` corresponds to the [LAPACK][lapack] level routine [`dgels`][lapack-dgels].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dgels = require( '@stdlib/lapack/base/dgels' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );

dgels.ndarray( 'no-transpose', N, N, N, A, N, 1, 0, B, N, 1, 0 );
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

[lapack-dgels]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dgels.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->