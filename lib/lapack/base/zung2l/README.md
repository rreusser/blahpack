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

# zung2l

> Generates all or part of the unitary matrix Q from a QL factorization determined by cgeqlf (unblocked algorithm).

<section class="usage">

## Usage

```javascript
var zung2l = require( '@stdlib/lapack/base/zung2l' );
```

#### zung2l( M, N, K, A, LDA, TAU, strideTAU, WORK, strideWORK )

Generates all or part of the unitary matrix Q from a QL factorization determined by cgeqlf (unblocked algorithm).

```javascript
var zung2l = require( '@stdlib/lapack/base/zung2l' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var TAU = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

zung2l.ndarray( N, N, N, A, N, 1, 0, TAU, 1, 0, WORK, 1, 0 );
```

The function has the following parameters:

-   **M**: number of rows.
-   **N**: number of columns.
-   **K**: inner dimension.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
-   **TAU**: input array `TAU`.
-   **strideTAU**: stride length for `TAU`.
-   **WORK**: input array `WORK`.
-   **strideWORK**: stride length for `WORK`.

#### zung2l.ndarray( M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWORK, offsetWORK )

Generates all or part of the unitary matrix Q from a QL factorization determined by cgeqlf (unblocked algorithm),, using alternative indexing semantics.

```javascript
var zung2l = require( '@stdlib/lapack/base/zung2l' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var TAU = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

zung2l.ndarray( N, N, N, A, N, 1, 0, TAU, 1, 0, WORK, 1, 0 );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **offsetTAU**: starting index for `TAU`.
-   **offsetWORK**: starting index for `WORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zung2l()` corresponds to the [LAPACK][lapack] level routine [`zung2l`][lapack-zung2l].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var zung2l = require( '@stdlib/lapack/base/zung2l' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var TAU = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

zung2l.ndarray( N, N, N, A, N, 1, 0, TAU, 1, 0, WORK, 1, 0 );
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

[lapack-zung2l]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zung2l.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->