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

# dlarra

> Computes the splitting points with threshold based on the representation.

<section class="usage">

## Usage

```javascript
var dlarra = require( '@stdlib/lapack/base/dlarra' );
```

#### dlarra( N, d, strideD, e, strideE, E2, strideE2, spltol, tnrm, nsplit, ISPLIT, strideISPLIT )

Computes the splitting points with threshold based on the representation.

```javascript
var dlarra = require( '@stdlib/lapack/base/dlarra' );

var N = 3;
var e = discreteUniform( N * N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var e = discreteUniform( N * N, -10, 10, opts );
var ISPLIT = discreteUniform( N, -10, 10, opts );

dlarra.ndarray( N, d, 1, 0, e, 1, 0, 1, 1, 0, 1, 1, 1, ISPLIT, 1, 0 );
```

The function has the following parameters:

-   **N**: number of columns.
-   **d**: `d`.
-   **strideD**: stride length for `D`.
-   **e**: `e`.
-   **strideE**: stride length for `E`.
-   **E2**: input array `E2`.
-   **strideE2**: stride of dimension 2 of `E`.
-   **spltol**: `spltol`.
-   **tnrm**: `tnrm`.
-   **nsplit**: `nsplit`.
-   **ISPLIT**: input array `ISPLIT`.
-   **strideISPLIT**: stride length for `ISPLIT`.

#### dlarra.ndarray( N, d, strideD, offsetD, e, strideE, offsetE, E2, strideE2, offsetE2, spltol, tnrm, nsplit, ISPLIT, strideISPLIT, offsetISPLIT )

Computes the splitting points with threshold based on the representation, using alternative indexing semantics.

```javascript
var dlarra = require( '@stdlib/lapack/base/dlarra' );

var N = 3;
var e = discreteUniform( N * N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var e = discreteUniform( N * N, -10, 10, opts );
var ISPLIT = discreteUniform( N, -10, 10, opts );

dlarra.ndarray( N, d, 1, 0, e, 1, 0, 1, 1, 0, 1, 1, 1, ISPLIT, 1, 0 );
```

The function has the following additional parameters:

-   **offsetD**: starting index for `D`.
-   **offsetE**: starting index for `E`.
-   **offsetE2**: starting index for `E2`.
-   **offsetISPLIT**: starting index for `ISPLIT`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dlarra()` corresponds to the [LAPACK][lapack] level routine [`dlarra`][lapack-dlarra].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dlarra = require( '@stdlib/lapack/base/dlarra' );

var N = 3;
var e = discreteUniform( N * N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var e = discreteUniform( N * N, -10, 10, opts );
var ISPLIT = discreteUniform( N, -10, 10, opts );

dlarra.ndarray( N, d, 1, 0, e, 1, 0, 1, 1, 0, 1, 1, 1, ISPLIT, 1, 0 );
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

[lapack-dlarra]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dlarra.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->