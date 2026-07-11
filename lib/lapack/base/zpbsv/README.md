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

# zpbsv

> Computes the solution to system of linear equations A·X = B.

<section class="usage">

## Usage

```javascript
var zpbsv = require( '@stdlib/lapack/base/zpbsv' );
```

#### zpbsv( uplo, N, kd, nrhs, AB, LDAB, B, LDB )

Computes the solution to system of linear equations A·X = B.

```javascript
var zpbsv = require( '@stdlib/lapack/base/zpbsv' );

var N = 3;
var AB = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );

zpbsv.ndarray( 'upper', N, 1, N, AB, N, 1, 0, B, N, 1, 0 );
```

The function has the following parameters:

-   **uplo**: specifies whether the upper or lower triangular part is referenced.
-   **N**: number of columns.
-   **kd**: `kd`.
-   **nrhs**: number of right-hand sides.
-   **AB**: input array `AB`.
-   **LDAB**: leading dimension of `AB`.
-   **B**: input array `B`.
-   **LDB**: leading dimension of `B`.

#### zpbsv.ndarray( uplo, N, kd, nrhs, AB, strideAB1, strideAB2, offsetAB, B, strideB1, strideB2, offsetB )

Computes the solution to system of linear equations A·X = B,, using alternative indexing semantics.

```javascript
var zpbsv = require( '@stdlib/lapack/base/zpbsv' );

var N = 3;
var AB = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );

zpbsv.ndarray( 'upper', N, 1, N, AB, N, 1, 0, B, N, 1, 0 );
```

The function has the following additional parameters:

-   **strideAB1**: stride of dimension 1 of `AB`.
-   **strideAB2**: stride of dimension 2 of `AB`.
-   **offsetAB**: starting index for `AB`.
-   **strideB1**: stride of dimension 1 of `B`.
-   **strideB2**: stride of dimension 2 of `B`.
-   **offsetB**: starting index for `B`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zpbsv()` corresponds to the [LAPACK][lapack] level routine [`zpbsv`][lapack-zpbsv].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var zpbsv = require( '@stdlib/lapack/base/zpbsv' );

var N = 3;
var AB = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );

zpbsv.ndarray( 'upper', N, 1, N, AB, N, 1, 0, B, N, 1, 0 );
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

[lapack-zpbsv]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zpbsv.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->