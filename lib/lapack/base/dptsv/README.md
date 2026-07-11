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

# dptsv

> Computes the solution to system of linear equations A·X = B for positive definite tridiagonal matrices.

<section class="usage">

## Usage

```javascript
var dptsv = require( '@stdlib/lapack/base/dptsv' );
```

#### dptsv( N, nrhs, d, strideD, e, strideE, B, LDB )

Computes the solution to system of linear equations A·X = B for positive definite tridiagonal matrices.

```javascript
var dptsv = require( '@stdlib/lapack/base/dptsv' );

var N = 3;
var B = discreteUniform( N * N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var e = discreteUniform( N, -10, 10, opts );

dptsv.ndarray( N, N, d, 1, 0, e, 1, 0, B, N, 1, 0 );
```

The function has the following parameters:

-   **N**: number of columns.
-   **nrhs**: number of right-hand sides.
-   **d**: `d`.
-   **strideD**: stride length for `D`.
-   **e**: `e`.
-   **strideE**: stride length for `E`.
-   **B**: input array `B`.
-   **LDB**: leading dimension of `B`.

#### dptsv.ndarray( N, nrhs, d, strideD, offsetD, e, strideE, offsetE, B, strideB1, strideB2, offsetB )

Computes the solution to system of linear equations A·X = B for positive definite tridiagonal matrices, using alternative indexing semantics.

```javascript
var dptsv = require( '@stdlib/lapack/base/dptsv' );

var N = 3;
var B = discreteUniform( N * N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var e = discreteUniform( N, -10, 10, opts );

dptsv.ndarray( N, N, d, 1, 0, e, 1, 0, B, N, 1, 0 );
```

The function has the following additional parameters:

-   **offsetD**: starting index for `D`.
-   **offsetE**: starting index for `E`.
-   **strideB1**: stride of dimension 1 of `B`.
-   **strideB2**: stride of dimension 2 of `B`.
-   **offsetB**: starting index for `B`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dptsv()` corresponds to the [LAPACK][lapack] level routine [`dptsv`][lapack-dptsv].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dptsv = require( '@stdlib/lapack/base/dptsv' );

var N = 3;
var B = discreteUniform( N * N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var e = discreteUniform( N, -10, 10, opts );

dptsv.ndarray( N, N, d, 1, 0, e, 1, 0, B, N, 1, 0 );
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

[lapack-dptsv]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dptsv.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->