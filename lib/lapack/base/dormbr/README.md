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

# dormbr

> Multiplies a general matrix by the orthogonal matrix Q or P from a bidiagonal reduction.

<section class="usage">

## Usage

```javascript
var dormbr = require( '@stdlib/lapack/base/dormbr' );
```

#### dormbr( order, vect, side, trans, M, N, K, A, LDA, TAU, strideTAU, C, LDC, WORK, strideWORK )

Multiplies a general matrix by the orthogonal matrix Q or P from a bidiagonal reduction.

```javascript
var dormbr = require( '@stdlib/lapack/base/dormbr' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var C = discreteUniform( N * N, -10, 10, opts );
var TAU = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

dormbr.ndarray( 'apply-Q', 'left', 'no-transpose', N, N, N, A, N, 1, 0, TAU, 1, 0, C, N, 1, 0, WORK, 1, 0 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **vect**: `'apply-Q'` to apply Q, `'apply-P'` to apply P^T.
-   **side**: specifies the side of the operation.
-   **trans**: specifies whether the matrix should be transposed.
-   **M**: number of rows.
-   **N**: number of columns.
-   **K**: inner dimension.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
-   **TAU**: input array `TAU`.
-   **strideTAU**: stride length for `TAU`.
-   **C**: input array `C`.
-   **LDC**: leading dimension of `C`.
-   **WORK**: input array `WORK`.
-   **strideWORK**: stride length for `WORK`.

#### dormbr.ndarray( vect, side, trans, M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC, WORK, strideWORK, offsetWORK )

Multiplies a general matrix by the orthogonal matrix Q or P from a bidiagonal reduction, using alternative indexing semantics.

```javascript
var dormbr = require( '@stdlib/lapack/base/dormbr' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var C = discreteUniform( N * N, -10, 10, opts );
var TAU = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

dormbr.ndarray( 'apply-Q', 'left', 'no-transpose', N, N, N, A, N, 1, 0, TAU, 1, 0, C, N, 1, 0, WORK, 1, 0 );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **offsetTAU**: starting index for `TAU`.
-   **strideC1**: stride of dimension 1 of `C`.
-   **strideC2**: stride of dimension 2 of `C`.
-   **offsetC**: starting index for `C`.
-   **offsetWORK**: starting index for `WORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dormbr()` corresponds to the [LAPACK][lapack] level routine [`dormbr`][lapack-dormbr].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dormbr = require( '@stdlib/lapack/base/dormbr' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var C = discreteUniform( N * N, -10, 10, opts );
var TAU = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

dormbr.ndarray( 'apply-Q', 'left', 'no-transpose', N, N, N, A, N, 1, 0, TAU, 1, 0, C, N, 1, 0, WORK, 1, 0 );
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

[lapack-dormbr]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dormbr.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->