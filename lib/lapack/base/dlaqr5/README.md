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

## Reference documentation

From the reference LAPACK 3.12.0 source of `DLAQR5`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

> Performs a single small-bulge multi-shift QR sweep.

### Purpose

DLAQR5, called by DLAQR0, performs a single small-bulge multi-shift QR sweep.

### Arguments

#### WANTT `[in]`

_LOGICAL_

`WANTT` = .true. if the quasi-triangular Schur factor is being computed. `WANTT` is set to .false. otherwise.

#### WANTZ `[in]`

_LOGICAL_

`WANTZ` = .true. if the orthogonal Schur factor is being computed. `WANTZ` is set to .false. otherwise.

#### KACC22 `[in]`

_INTEGER with value 0, 1, or 2_

Specifies the computation mode of far-from-diagonal orthogonal updates.

-   `= 0`: DLAQR5 does not accumulate reflections and does not use matrix-matrix multiply to update far-from-diagonal matrix entries.
-   `= 1`: DLAQR5 accumulates reflections and uses matrix-matrix multiply to update the far-from-diagonal matrix entries.
-   `= 2`: Same as `KACC22 = 1`. This option used to enable exploiting the 2-by-2 structure during matrix multiplications, but this is no longer supported.

#### N `[in]`

_INTEGER_

N is the order of the Hessenberg matrix H upon which this subroutine operates.

#### KTOP `[in]`

_INTEGER_

#### KBOT `[in]`

_INTEGER_

These are the first and last rows and columns of an isolated diagonal block upon which the QR sweep is to be applied. It is assumed without a check that

either `KTOP = 1` or $H(\mathrm{KTOP},\mathrm{KTOP}-1) = 0$

and

either `KBOT = N` or $H(\mathrm{KBOT}+1,\mathrm{KBOT}) = 0$.

#### NSHFTS `[in]`

_INTEGER_

`NSHFTS` gives the number of simultaneous shifts. `NSHFTS` must be positive and even.

#### SR `[in,out]`

_DOUBLE PRECISION array, dimension (NSHFTS)_

#### SI `[in,out]`

_DOUBLE PRECISION array, dimension (NSHFTS)_

`SR` contains the real parts and `SI` contains the imaginary parts of the `NSHFTS` shifts of origin that define the multi-shift QR sweep. On output `SR` and `SI` may be reordered.

#### H `[in,out]`

_DOUBLE PRECISION array, dimension (LDH,N)_

On input H contains a Hessenberg matrix. On output a multi-shift QR sweep with shifts $\mathrm{SR}(J)+i \, \mathrm{SI}(J)$ is applied to the isolated diagonal block in rows and columns `KTOP` through `KBOT`.

#### LDH `[in]`

_INTEGER_

`LDH` is the leading dimension of H just as declared in the calling procedure. $\mathrm{LDH} \ge \max (1,N)$.

#### ILOZ `[in]`

_INTEGER_

#### IHIZ `[in]`

_INTEGER_

Specify the rows of Z to which transformations must be applied if `WANTZ` is .TRUE.. $1 \le \mathrm{ILOZ} \le \mathrm{IHIZ} \le N$

#### Z `[in,out]`

_DOUBLE PRECISION array, dimension (LDZ,IHIZ)_

If `WANTZ` = .TRUE., then the QR Sweep orthogonal similarity transformation is accumulated into `Z(ILOZ:IHIZ,ILOZ:IHIZ)` from the right. If `WANTZ` = .FALSE., then Z is unreferenced.

#### LDZ `[in]`

_INTEGER_

LDA is the leading dimension of Z just as declared in the calling procedure. $\mathrm{LDZ} \ge N$.

#### V `[out]`

_DOUBLE PRECISION array, dimension (LDV,NSHFTS/2)_

#### LDV `[in]`

_INTEGER_

`LDV` is the leading dimension of V as declared in the calling procedure. $\mathrm{LDV} \ge 3$.

#### U `[out]`

_DOUBLE PRECISION array, dimension (LDU,2\*NSHFTS)_

#### LDU `[in]`

_INTEGER_

`LDU` is the leading dimension of U just as declared in the in the calling subroutine. $\mathrm{LDU} \ge 2 \, \mathrm{NSHFTS}$.

#### NV `[in]`

_INTEGER_

`NV` is the number of rows in `WV` agailable for workspace. $\mathrm{NV} \ge 1$.

#### WV `[out]`

_DOUBLE PRECISION array, dimension (LDWV,2\*NSHFTS)_

#### LDWV `[in]`

_INTEGER_

`LDWV` is the leading dimension of `WV` as declared in the in the calling subroutine. $\mathrm{LDWV} \ge \mathrm{NV}$.

#### NH `[in]`

_INTEGER_

`NH` is the number of columns in array `WH` available for workspace. $\mathrm{NH} \ge 1$.

#### WH `[out]`

_DOUBLE PRECISION array, dimension (LDWH,NH)_

#### LDWH `[in]`

_INTEGER_

Leading dimension of `WH` just as declared in the calling procedure. $\mathrm{LDWH} \ge 2 \, \mathrm{NSHFTS}$.

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