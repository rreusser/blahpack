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

# ztrsyl

> Solves the complex Sylvester matrix equation: op(A)·X + X·op(B) = scale·C or op(A)·X - X·op(B) = scale·C.

<section class="usage">

## Usage

```javascript
var ztrsyl = require( '@stdlib/lapack/base/ztrsyl' );
```

#### ztrsyl( trana, tranb, isgn, M, N, A, LDA, B, LDB, C, LDC, scale )

Solves the complex Sylvester matrix equation: op(A)·X + X·op(B) = scale·C or op(A)·X - X·op(B) = scale·C.

```javascript
var ztrsyl = require( '@stdlib/lapack/base/ztrsyl' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var C = discreteUniform( N * N, -10, 10, opts );

ztrsyl.ndarray( 1, 1, 1, N, N, A, N, 1, 0, B, N, 1, 0, C, N, 1, 0, 1.0 );
```

The function has the following parameters:

-   **trana**: `trana`.
-   **tranb**: `tranb`.
-   **isgn**: `isgn`.
-   **M**: number of rows.
-   **N**: number of columns.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
-   **B**: input array `B`.
-   **LDB**: leading dimension of `B`.
-   **C**: input array `C`.
-   **LDC**: leading dimension of `C`.
-   **scale**: `scale`.

#### ztrsyl.ndarray( trana, tranb, isgn, M, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, C, strideC1, strideC2, offsetC, scale )

Solves the complex Sylvester matrix equation: op(A)·X + X·op(B) = scale·C or op(A)·X - X·op(B) = scale·C, using alternative indexing semantics.

```javascript
var ztrsyl = require( '@stdlib/lapack/base/ztrsyl' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var C = discreteUniform( N * N, -10, 10, opts );

ztrsyl.ndarray( 1, 1, 1, N, N, A, N, 1, 0, B, N, 1, 0, C, N, 1, 0, 1.0 );
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

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `ztrsyl()` corresponds to the [LAPACK][lapack] level routine [`ztrsyl`][lapack-ztrsyl].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var ztrsyl = require( '@stdlib/lapack/base/ztrsyl' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var C = discreteUniform( N * N, -10, 10, opts );

ztrsyl.ndarray( 1, 1, 1, N, N, A, N, 1, 0, B, N, 1, 0, C, N, 1, 0, 1.0 );
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

[lapack-ztrsyl]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__ztrsyl.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->