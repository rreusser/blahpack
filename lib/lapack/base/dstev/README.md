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

# dstev

> Computes the eigenvalues and, optionally, the left and/or right eigenvectors.

<section class="usage">

## Usage

```javascript
var dstev = require( '@stdlib/lapack/base/dstev' );
```

#### dstev( jobz, N, d, strideD, e, strideE, Z, LDZ, WORK, strideWORK )

Computes the eigenvalues and, optionally, the left and/or right eigenvectors.

```javascript
var dstev = require( '@stdlib/lapack/base/dstev' );

var N = 3;
var Z = discreteUniform( N * N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var e = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

dstev.ndarray( 'compute-vectors', N, d, 1, 0, e, 1, 0, Z, N, 1, 0, WORK, 1, 0 );
```

The function has the following parameters:

-   **jobz**: `jobz`.
-   **N**: number of columns.
-   **d**: `d`.
-   **strideD**: stride length for `D`.
-   **e**: `e`.
-   **strideE**: stride length for `E`.
-   **Z**: input array `Z`.
-   **LDZ**: leading dimension of `Z`.
-   **WORK**: input array `WORK`.
-   **strideWORK**: stride length for `WORK`.

#### dstev.ndarray( jobz, N, d, strideD, offsetD, e, strideE, offsetE, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, offsetWORK )

Computes the eigenvalues and, optionally, the left and/or right eigenvectors, using alternative indexing semantics.

```javascript
var dstev = require( '@stdlib/lapack/base/dstev' );

var N = 3;
var Z = discreteUniform( N * N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var e = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

dstev.ndarray( 'compute-vectors', N, d, 1, 0, e, 1, 0, Z, N, 1, 0, WORK, 1, 0 );
```

The function has the following additional parameters:

-   **offsetD**: starting index for `D`.
-   **offsetE**: starting index for `E`.
-   **strideZ1**: stride of dimension 1 of `Z`.
-   **strideZ2**: stride of dimension 2 of `Z`.
-   **offsetZ**: starting index for `Z`.
-   **offsetWORK**: starting index for `WORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dstev()` corresponds to the [LAPACK][lapack] level routine [`dstev`][lapack-dstev].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dstev = require( '@stdlib/lapack/base/dstev' );

var N = 3;
var Z = discreteUniform( N * N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var e = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

dstev.ndarray( 'compute-vectors', N, d, 1, 0, e, 1, 0, Z, N, 1, 0, WORK, 1, 0 );
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

[lapack-dstev]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dstev.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->