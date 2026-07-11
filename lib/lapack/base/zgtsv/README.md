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

# zgtsv

> Computes the solution to system of linear equations A·X = B for general tridiagonal matrices.

<section class="usage">

## Usage

```javascript
var zgtsv = require( '@stdlib/lapack/base/zgtsv' );
```

#### zgtsv( N, nrhs, DL, strideDL, d, strideD, DU, strideDU, B, LDB )

Computes the solution to system of linear equations A·X = B for general tridiagonal matrices.

```javascript
var zgtsv = require( '@stdlib/lapack/base/zgtsv' );

var N = 3;
var B = discreteUniform( N * N, -10, 10, opts );
var DL = discreteUniform( N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var DU = discreteUniform( N, -10, 10, opts );

zgtsv.ndarray( N, N, DL, 1, 0, d, 1, 0, DU, 1, 0, B, N, 1, 0 );
```

The function has the following parameters:

-   **N**: number of columns.
-   **nrhs**: number of right-hand sides.
-   **DL**: input array `DL`.
-   **strideDL**: stride length for `DL`.
-   **d**: `d`.
-   **strideD**: stride length for `D`.
-   **DU**: input array `DU`.
-   **strideDU**: stride length for `DU`.
-   **B**: input array `B`.
-   **LDB**: leading dimension of `B`.

#### zgtsv.ndarray( N, nrhs, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU, B, strideB1, strideB2, offsetB )

Computes the solution to system of linear equations A·X = B for general tridiagonal matrices, using alternative indexing semantics.

```javascript
var zgtsv = require( '@stdlib/lapack/base/zgtsv' );

var N = 3;
var B = discreteUniform( N * N, -10, 10, opts );
var DL = discreteUniform( N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var DU = discreteUniform( N, -10, 10, opts );

zgtsv.ndarray( N, N, DL, 1, 0, d, 1, 0, DU, 1, 0, B, N, 1, 0 );
```

The function has the following additional parameters:

-   **offsetDL**: starting index for `DL`.
-   **offsetD**: starting index for `D`.
-   **offsetDU**: starting index for `DU`.
-   **strideB1**: stride of dimension 1 of `B`.
-   **strideB2**: stride of dimension 2 of `B`.
-   **offsetB**: starting index for `B`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zgtsv()` corresponds to the [LAPACK][lapack] level routine [`zgtsv`][lapack-zgtsv].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var zgtsv = require( '@stdlib/lapack/base/zgtsv' );

var N = 3;
var B = discreteUniform( N * N, -10, 10, opts );
var DL = discreteUniform( N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var DU = discreteUniform( N, -10, 10, opts );

zgtsv.ndarray( N, N, DL, 1, 0, d, 1, 0, DU, 1, 0, B, N, 1, 0 );
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

[lapack-zgtsv]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zgtsv.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->