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

# dlaqr5

> Accesses a 2D array element (1-based row i, column j).

<section class="usage">

## Usage

```javascript
var dlaqr5 = require( '@stdlib/lapack/base/dlaqr5' );
```

#### dlaqr5( A, sA1, sA2, oA, i, j )

Accesses a 2D array element (1-based row i, column j).

```javascript
var dlaqr5 = require( '@stdlib/lapack/base/dlaqr5' );

var N = 3;
var H = discreteUniform( N * N, -10, 10, opts );
var Z = discreteUniform( N * N, -10, 10, opts );
var V = discreteUniform( N * N, -10, 10, opts );
var U = discreteUniform( N * N, -10, 10, opts );
var WV = discreteUniform( N * N, -10, 10, opts );
var WH = discreteUniform( N * N, -10, 10, opts );
var SR = discreteUniform( N, -10, 10, opts );
var SI = discreteUniform( N, -10, 10, opts );

dlaqr5.ndarray( 1, 1, 1, N, 1, 1, 1, SR, 1, 0, SI, 1, 0, H, N, 1, 0, 1, 1, Z, N, 1, 0, V, N, 1, 0, U, N, 1, 0, 1, WV, N, 1, 0, 1, WH, N, 1, 0 );
```

The function has the following parameters:

-   **A**: input array `A`.
-   **sA1**: `sA1`.
-   **sA2**: `sA2`.
-   **oA**: `oA`.
-   **i**: `i`.
-   **j**: `j`.

#### dlaqr5.ndarray( wantt, wantz, kacc22, N, ktop, kbot, nshfts, SR, strideSR, offsetSR, SI, strideSI, offsetSI, H, strideH1, strideH2, offsetH, iloz, ihiz, Z, strideZ1, strideZ2, offsetZ, V, strideV1, strideV2, offsetV, U, strideU1, strideU2, offsetU, nv, WV, strideWV1, strideWV2, offsetWV, nh, WH, strideWH1, strideWH2, offsetWH )

Accesses a 2D array element (1-based row i, column j), using alternative indexing semantics.

```javascript
var dlaqr5 = require( '@stdlib/lapack/base/dlaqr5' );

var N = 3;
var H = discreteUniform( N * N, -10, 10, opts );
var Z = discreteUniform( N * N, -10, 10, opts );
var V = discreteUniform( N * N, -10, 10, opts );
var U = discreteUniform( N * N, -10, 10, opts );
var WV = discreteUniform( N * N, -10, 10, opts );
var WH = discreteUniform( N * N, -10, 10, opts );
var SR = discreteUniform( N, -10, 10, opts );
var SI = discreteUniform( N, -10, 10, opts );

dlaqr5.ndarray( 1, 1, 1, N, 1, 1, 1, SR, 1, 0, SI, 1, 0, H, N, 1, 0, 1, 1, Z, N, 1, 0, V, N, 1, 0, U, N, 1, 0, 1, WV, N, 1, 0, 1, WH, N, 1, 0 );
```

The function has the following additional parameters:

-   **wantt**: `wantt`.
-   **wantz**: `wantz`.
-   **kacc22**: `kacc22`.
-   **N**: number of columns.
-   **ktop**: `ktop`.
-   **kbot**: `kbot`.
-   **nshfts**: `nshfts`.
-   **SR**: input array `SR`.
-   **strideSR**: stride length for `SR`.
-   **offsetSR**: starting index for `SR`.
-   **SI**: input array `SI`.
-   **strideSI**: stride length for `SI`.
-   **offsetSI**: starting index for `SI`.
-   **H**: input array `H`.
-   **strideH1**: stride of dimension 1 of `H`.
-   **strideH2**: stride of dimension 2 of `H`.
-   **offsetH**: starting index for `H`.
-   **iloz**: `iloz`.
-   **ihiz**: `ihiz`.
-   **Z**: input array `Z`.
-   **strideZ1**: stride of dimension 1 of `Z`.
-   **strideZ2**: stride of dimension 2 of `Z`.
-   **offsetZ**: starting index for `Z`.
-   **V**: input array `V`.
-   **strideV1**: stride of dimension 1 of `V`.
-   **strideV2**: stride of dimension 2 of `V`.
-   **offsetV**: starting index for `V`.
-   **U**: input array `U`.
-   **strideU1**: stride of dimension 1 of `U`.
-   **strideU2**: stride of dimension 2 of `U`.
-   **offsetU**: starting index for `U`.
-   **nv**: `nv`.
-   **WV**: input array `WV`.
-   **strideWV1**: stride of dimension 1 of `WV`.
-   **strideWV2**: stride of dimension 2 of `WV`.
-   **offsetWV**: starting index for `WV`.
-   **nh**: `nh`.
-   **WH**: input array `WH`.
-   **strideWH1**: stride of dimension 1 of `WH`.
-   **strideWH2**: stride of dimension 2 of `WH`.
-   **offsetWH**: starting index for `WH`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dlaqr5()` corresponds to the [LAPACK][lapack] level routine [`dlaqr5`][lapack-dlaqr5].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dlaqr5 = require( '@stdlib/lapack/base/dlaqr5' );

var N = 3;
var H = discreteUniform( N * N, -10, 10, opts );
var Z = discreteUniform( N * N, -10, 10, opts );
var V = discreteUniform( N * N, -10, 10, opts );
var U = discreteUniform( N * N, -10, 10, opts );
var WV = discreteUniform( N * N, -10, 10, opts );
var WH = discreteUniform( N * N, -10, 10, opts );
var SR = discreteUniform( N, -10, 10, opts );
var SI = discreteUniform( N, -10, 10, opts );

dlaqr5.ndarray( 1, 1, 1, N, 1, 1, 1, SR, 1, 0, SI, 1, 0, H, N, 1, 0, 1, 1, Z, N, 1, 0, V, N, 1, 0, U, N, 1, 0, 1, WV, N, 1, 0, 1, WH, N, 1, 0 );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/dlaqr5.f; do not edit) -->

<section class="fortran-docs">

## Reference notes

The mathematical description from the reference LAPACK 3.12.0 source of `DLAQR5`. Indices are the 1-based Fortran indices of the source.

### Purpose

DLAQR5, called by DLAQR0, performs a single small-bulge multi-shift QR sweep.

### References

K. Braman, R. Byers and R. Mathias, The Multi-Shift QR Algorithm Part I: Maintaining Well Focused Shifts, and Level 3 Performance, SIAM Journal of Matrix Analysis, volume 23, pages 929--947, 2002.

Lars Karlsson, Daniel Kressner, and Bruno Lang, Optimally packed chains of bulges in multishift QR algorithms. ACM Trans. Math. Softw. 40, 2, Article 12 (February 2014).

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[lapack]: https://www.netlib.org/lapack/explore-html/

[lapack-dlaqr5]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dlaqr5.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->