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

# dlaqr1

> Sets a scalar multiple of the first column of the product of 2-by-2 or 3-by-3 matrix H and specified shifts.

<section class="usage">

## Usage

```javascript
var dlaqr1 = require( '@stdlib/lapack/base/dlaqr1' );
```

#### dlaqr1( N, H, LDH, sr1, si1, sr2, si2, v, strideV )

Sets a scalar multiple of the first column of the product of 2-by-2 or 3-by-3 matrix H and specified shifts.

```javascript
var dlaqr1 = require( '@stdlib/lapack/base/dlaqr1' );

var N = 3;
var H = discreteUniform( N * N, -10, 10, opts );
var v = discreteUniform( N, -10, 10, opts );

dlaqr1.ndarray( N, H, N, 1, 0, 1, 1, 1, 1, v, 1, 0 );
```

The function has the following parameters:

-   **N**: number of columns.
-   **H**: input array `H`.
-   **LDH**: leading dimension of `H`.
-   **sr1**: `sr1`.
-   **si1**: `si1`.
-   **sr2**: `sr2`.
-   **si2**: `si2`.
-   **v**: `v`.
-   **strideV**: stride length for `V`.

#### dlaqr1.ndarray( N, H, strideH1, strideH2, offsetH, sr1, si1, sr2, si2, v, strideV, offsetV )

Sets a scalar multiple of the first column of the product of 2-by-2 or 3-by-3 matrix H and specified shifts, using alternative indexing semantics.

```javascript
var dlaqr1 = require( '@stdlib/lapack/base/dlaqr1' );

var N = 3;
var H = discreteUniform( N * N, -10, 10, opts );
var v = discreteUniform( N, -10, 10, opts );

dlaqr1.ndarray( N, H, N, 1, 0, 1, 1, 1, 1, v, 1, 0 );
```

The function has the following additional parameters:

-   **strideH1**: stride of dimension 1 of `H`.
-   **strideH2**: stride of dimension 2 of `H`.
-   **offsetH**: starting index for `H`.
-   **offsetV**: starting index for `V`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dlaqr1()` corresponds to the [LAPACK][lapack] level routine [`dlaqr1`][lapack-dlaqr1].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dlaqr1 = require( '@stdlib/lapack/base/dlaqr1' );

var N = 3;
var H = discreteUniform( N * N, -10, 10, opts );
var v = discreteUniform( N, -10, 10, opts );

dlaqr1.ndarray( N, H, N, 1, 0, 1, 1, 1, 1, v, 1, 0 );
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

[lapack-dlaqr1]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dlaqr1.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->