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

# dlaexc

> Swaps adjacent diagonal blocks of a real upper quasi-triangular matrix in Schur canonical form, by an orthogonal similarity transformation.

<section class="usage">

## Usage

```javascript
var dlaexc = require( '@stdlib/lapack/base/dlaexc' );
```

#### dlaexc( wantq, N, T, LDT, Q, LDQ, j1, n1, n2, WORK, strideWORK )

Swaps adjacent diagonal blocks of a real upper quasi-triangular matrix in Schur canonical form, by an orthogonal similarity transformation.

```javascript
var dlaexc = require( '@stdlib/lapack/base/dlaexc' );

var N = 3;
var T = discreteUniform( N * N, -10, 10, opts );
var Q = discreteUniform( N * N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

dlaexc.ndarray( 1, N, T, N, 1, 0, Q, N, 1, 0, 1, 1, 1, WORK, 1, 0 );
```

The function has the following parameters:

-   **wantq**: `wantq`.
-   **N**: number of columns.
-   **T**: input array `T`.
-   **LDT**: leading dimension of `T`.
-   **Q**: input array `Q`.
-   **LDQ**: leading dimension of `Q`.
-   **j1**: `j1`.
-   **n1**: `n1`.
-   **n2**: `n2`.
-   **WORK**: input array `WORK`.
-   **strideWORK**: stride length for `WORK`.

#### dlaexc.ndarray( wantq, N, T, strideT1, strideT2, offsetT, Q, strideQ1, strideQ2, offsetQ, j1, n1, n2, WORK, strideWORK, offsetWORK )

Swaps adjacent diagonal blocks of a real upper quasi-triangular matrix in Schur canonical form, by an orthogonal similarity transformation, using alternative indexing semantics.

```javascript
var dlaexc = require( '@stdlib/lapack/base/dlaexc' );

var N = 3;
var T = discreteUniform( N * N, -10, 10, opts );
var Q = discreteUniform( N * N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

dlaexc.ndarray( 1, N, T, N, 1, 0, Q, N, 1, 0, 1, 1, 1, WORK, 1, 0 );
```

The function has the following additional parameters:

-   **strideT1**: stride of dimension 1 of `T`.
-   **strideT2**: stride of dimension 2 of `T`.
-   **offsetT**: starting index for `T`.
-   **strideQ1**: stride of dimension 1 of `Q`.
-   **strideQ2**: stride of dimension 2 of `Q`.
-   **offsetQ**: starting index for `Q`.
-   **offsetWORK**: starting index for `WORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dlaexc()` corresponds to the [LAPACK][lapack] level routine [`dlaexc`][lapack-dlaexc].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dlaexc = require( '@stdlib/lapack/base/dlaexc' );

var N = 3;
var T = discreteUniform( N * N, -10, 10, opts );
var Q = discreteUniform( N * N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

dlaexc.ndarray( 1, N, T, N, 1, 0, Q, N, 1, 0, 1, 1, 1, WORK, 1, 0 );
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

[lapack-dlaexc]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dlaexc.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->