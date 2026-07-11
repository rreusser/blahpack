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

# zgghrd

> Reduces a pair of complex matrices (A,B) to generalized upper Hessenberg form using unitary transformations.

<section class="usage">

## Usage

```javascript
var zgghrd = require( '@stdlib/lapack/base/zgghrd' );
```

#### zgghrd( order, compq, compz, N, ilo, ihi, A, LDA, B, LDB, Q, LDQ, Z, LDZ )

Reduces a pair of complex matrices (A,B) to generalized upper Hessenberg form using unitary transformations.

```javascript
var zgghrd = require( '@stdlib/lapack/base/zgghrd' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var Q = discreteUniform( N * N, -10, 10, opts );
var Z = discreteUniform( N * N, -10, 10, opts );

zgghrd.ndarray( 'update', 'update', N, N, N, A, N, 1, 0, B, N, 1, 0, Q, N, 1, 0, Z, N, 1, 0 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **compq**: `compq`.
-   **compz**: `compz`.
-   **N**: number of columns.
-   **ilo**: `ilo`.
-   **ihi**: `ihi`.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
-   **B**: input array `B`.
-   **LDB**: leading dimension of `B`.
-   **Q**: input array `Q`.
-   **LDQ**: leading dimension of `Q`.
-   **Z**: input array `Z`.
-   **LDZ**: leading dimension of `Z`.

#### zgghrd.ndarray( compq, compz, N, ilo, ihi, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ )

Reduces a pair of complex matrices (A,B) to generalized upper Hessenberg form using unitary transformations, using alternative indexing semantics.

```javascript
var zgghrd = require( '@stdlib/lapack/base/zgghrd' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var Q = discreteUniform( N * N, -10, 10, opts );
var Z = discreteUniform( N * N, -10, 10, opts );

zgghrd.ndarray( 'update', 'update', N, N, N, A, N, 1, 0, B, N, 1, 0, Q, N, 1, 0, Z, N, 1, 0 );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **strideB1**: stride of dimension 1 of `B`.
-   **strideB2**: stride of dimension 2 of `B`.
-   **offsetB**: starting index for `B`.
-   **strideQ1**: stride of dimension 1 of `Q`.
-   **strideQ2**: stride of dimension 2 of `Q`.
-   **offsetQ**: starting index for `Q`.
-   **strideZ1**: stride of dimension 1 of `Z`.
-   **strideZ2**: stride of dimension 2 of `Z`.
-   **offsetZ**: starting index for `Z`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zgghrd()` corresponds to the [LAPACK][lapack] level routine [`zgghrd`][lapack-zgghrd].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var zgghrd = require( '@stdlib/lapack/base/zgghrd' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var Q = discreteUniform( N * N, -10, 10, opts );
var Z = discreteUniform( N * N, -10, 10, opts );

zgghrd.ndarray( 'update', 'update', N, N, N, A, N, 1, 0, B, N, 1, 0, Q, N, 1, 0, Z, N, 1, 0 );
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

[lapack-zgghrd]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zgghrd.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->