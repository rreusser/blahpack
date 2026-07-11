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

# dtgsyl

> Solves the generalized Sylvester equation: A·R - L·B = scale·C (1) D·R - L·E = scale·F.

<section class="usage">

## Usage

```javascript
var dtgsyl = require( '@stdlib/lapack/base/dtgsyl' );
```

#### dtgsyl( trans, ijob, M, N, A, LDA, B, LDB, C, LDC, D, LDD, E, LDE, F, LDF, scale, dif, WORK, strideWORK, lwork, IWORK, strideIWORK )

Solves the generalized Sylvester equation: A·R - L·B = scale·C (1) D·R - L·E = scale·F.

```javascript
var dtgsyl = require( '@stdlib/lapack/base/dtgsyl' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var C = discreteUniform( N * N, -10, 10, opts );
var D = discreteUniform( N * N, -10, 10, opts );
var E = discreteUniform( N * N, -10, 10, opts );
var F = discreteUniform( N * N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );

dtgsyl.ndarray( 'no-transpose', 1, N, N, A, N, 1, 0, B, N, 1, 0, C, N, 1, 0, D, N, 1, 0, E, N, 1, 0, F, N, 1, 0, 1.0, 1, WORK, 1, 0, N, IWORK, 1, 0 );
```

The function has the following parameters:

-   **trans**: specifies whether the matrix should be transposed.
-   **ijob**: `ijob`.
-   **M**: number of rows.
-   **N**: number of columns.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
-   **B**: input array `B`.
-   **LDB**: leading dimension of `B`.
-   **C**: input array `C`.
-   **LDC**: leading dimension of `C`.
-   **D**: input array `D`.
-   **LDD**: leading dimension of `D`.
-   **E**: input array `E`.
-   **LDE**: leading dimension of `E`.
-   **F**: input array `F`.
-   **LDF**: leading dimension of `F`.
-   **scale**: `scale`.
-   **dif**: `dif`.
-   **WORK**: input array `WORK`.
-   **strideWORK**: stride length for `WORK`.
-   **lwork**: `lwork`.
-   **IWORK**: input array `IWORK`.
-   **strideIWORK**: stride length for `IWORK`.

#### dtgsyl.ndarray( trans, ijob, M, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, C, strideC1, strideC2, offsetC, D, strideD1, strideD2, offsetD, E, strideE1, strideE2, offsetE, F, strideF1, strideF2, offsetF, scale, dif, WORK, strideWORK, offsetWORK, lwork, IWORK, strideIWORK, offsetIWORK )

Solves the generalized Sylvester equation: A·R - L·B = scale·C (1) D·R - L·E = scale·F, using alternative indexing semantics.

```javascript
var dtgsyl = require( '@stdlib/lapack/base/dtgsyl' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var C = discreteUniform( N * N, -10, 10, opts );
var D = discreteUniform( N * N, -10, 10, opts );
var E = discreteUniform( N * N, -10, 10, opts );
var F = discreteUniform( N * N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );

dtgsyl.ndarray( 'no-transpose', 1, N, N, A, N, 1, 0, B, N, 1, 0, C, N, 1, 0, D, N, 1, 0, E, N, 1, 0, F, N, 1, 0, 1.0, 1, WORK, 1, 0, N, IWORK, 1, 0 );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **strideB1**: stride of dimension 1 of `B`.
-   **strideB2**: stride of dimension 2 of `B`.
-   **offsetB**: starting index for `B`.
-   **strideC1**: stride of dimension 1 of `C`.
-   **strideC2**: stride of dimension 2 of `C`.
-   **offsetC**: starting index for `C`.
-   **strideD1**: stride of dimension 1 of `D`.
-   **strideD2**: stride of dimension 2 of `D`.
-   **offsetD**: starting index for `D`.
-   **strideE1**: stride of dimension 1 of `E`.
-   **strideE2**: stride of dimension 2 of `E`.
-   **offsetE**: starting index for `E`.
-   **strideF1**: stride of dimension 1 of `F`.
-   **strideF2**: stride of dimension 2 of `F`.
-   **offsetF**: starting index for `F`.
-   **offsetWORK**: starting index for `WORK`.
-   **offsetIWORK**: starting index for `IWORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dtgsyl()` corresponds to the [LAPACK][lapack] level routine [`dtgsyl`][lapack-dtgsyl].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dtgsyl = require( '@stdlib/lapack/base/dtgsyl' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var C = discreteUniform( N * N, -10, 10, opts );
var D = discreteUniform( N * N, -10, 10, opts );
var E = discreteUniform( N * N, -10, 10, opts );
var F = discreteUniform( N * N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );

dtgsyl.ndarray( 'no-transpose', 1, N, N, A, N, 1, 0, B, N, 1, 0, C, N, 1, 0, D, N, 1, 0, E, N, 1, 0, F, N, 1, 0, 1.0, 1, WORK, 1, 0, N, IWORK, 1, 0 );
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

[lapack-dtgsyl]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dtgsyl.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->