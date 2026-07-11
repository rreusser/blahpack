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

# dgesc2

> Solves a system of linear equations using the LU factorization with complete pivoting computed by sgetc2.

<section class="usage">

## Usage

```javascript
var dgesc2 = require( '@stdlib/lapack/base/dgesc2' );
```

#### dgesc2( N, A, LDA, RHS, strideRHS, IPIV, strideIPIV, JPIV, strideJPIV, scale )

Solves a system of linear equations using the LU factorization with complete pivoting computed by sgetc2.

```javascript
var dgesc2 = require( '@stdlib/lapack/base/dgesc2' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var RHS = discreteUniform( N, -10, 10, opts );
var IPIV = discreteUniform( N, -10, 10, opts );
var JPIV = discreteUniform( N, -10, 10, opts );

dgesc2.ndarray( N, A, N, 1, 0, RHS, 1, 0, IPIV, 1, 0, JPIV, 1, 0, 1.0 );
```

The function has the following parameters:

-   **N**: number of columns.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
-   **RHS**: input array `RHS`.
-   **strideRHS**: stride length for `RHS`.
-   **IPIV**: input array `IPIV`.
-   **strideIPIV**: stride length for `IPIV`.
-   **JPIV**: input array `JPIV`.
-   **strideJPIV**: stride length for `JPIV`.
-   **scale**: `scale`.

#### dgesc2.ndarray( N, A, strideA1, strideA2, offsetA, RHS, strideRHS, offsetRHS, IPIV, strideIPIV, offsetIPIV, JPIV, strideJPIV, offsetJPIV, scale )

Solves a system of linear equations using the LU factorization with complete pivoting computed by sgetc2, using alternative indexing semantics.

```javascript
var dgesc2 = require( '@stdlib/lapack/base/dgesc2' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var RHS = discreteUniform( N, -10, 10, opts );
var IPIV = discreteUniform( N, -10, 10, opts );
var JPIV = discreteUniform( N, -10, 10, opts );

dgesc2.ndarray( N, A, N, 1, 0, RHS, 1, 0, IPIV, 1, 0, JPIV, 1, 0, 1.0 );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **offsetRHS**: starting index for `RHS`.
-   **offsetIPIV**: starting index for `IPIV`.
-   **offsetJPIV**: starting index for `JPIV`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dgesc2()` corresponds to the [LAPACK][lapack] level routine [`dgesc2`][lapack-dgesc2].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dgesc2 = require( '@stdlib/lapack/base/dgesc2' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var RHS = discreteUniform( N, -10, 10, opts );
var IPIV = discreteUniform( N, -10, 10, opts );
var JPIV = discreteUniform( N, -10, 10, opts );

dgesc2.ndarray( N, A, N, 1, 0, RHS, 1, 0, IPIV, 1, 0, JPIV, 1, 0, 1.0 );
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

[lapack-dgesc2]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dgesc2.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->