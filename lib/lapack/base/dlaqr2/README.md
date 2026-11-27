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

# dlaqr2

> Performs aggressive early deflation on an upper Hessenberg matrix.

<section class="usage">

## Usage

```javascript
var dlaqr2 = require( '@stdlib/lapack/base/dlaqr2' );
```

#### dlaqr2( wantt, wantz, N, ktop, kbot, nw, H, LDH, iloz, ihiz, Z, LDZ, SR, strideSR, SI, strideSI, V, LDV, nh, T, LDT, nv, WV, LDWV, WORK, strideWORK, lwork )

Performs aggressive early deflation on an upper Hessenberg matrix.

```javascript
var dlaqr2 = require( '@stdlib/lapack/base/dlaqr2' );

var N = 3;
var H = discreteUniform( N * N, -10, 10, opts );
var Z = discreteUniform( N * N, -10, 10, opts );
var V = discreteUniform( N * N, -10, 10, opts );
var T = discreteUniform( N * N, -10, 10, opts );
var WV = discreteUniform( N * N, -10, 10, opts );
var SR = discreteUniform( N, -10, 10, opts );
var SI = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

dlaqr2.ndarray( 1, 1, N, 1, 1, 1, H, N, 1, 0, 1, 1, Z, N, 1, 0, 1, 1, SR, 1, 0, SI, 1, 0, V, N, 1, 0, 1, T, N, 1, 0, 1, WV, N, 1, 0, WORK, 1, 0, N );
```

The function has the following parameters:

-   **wantt**: `wantt`.
-   **wantz**: `wantz`.
-   **N**: number of columns.
-   **ktop**: `ktop`.
-   **kbot**: `kbot`.
-   **nw**: `nw`.
-   **H**: input array `H`.
-   **LDH**: leading dimension of `H`.
-   **iloz**: `iloz`.
-   **ihiz**: `ihiz`.
-   **Z**: input array `Z`.
-   **LDZ**: leading dimension of `Z`.
-   **SR**: input array `SR`.
-   **strideSR**: stride length for `SR`.
-   **SI**: input array `SI`.
-   **strideSI**: stride length for `SI`.
-   **V**: input array `V`.
-   **LDV**: leading dimension of `V`.
-   **nh**: `nh`.
-   **T**: input array `T`.
-   **LDT**: leading dimension of `T`.
-   **nv**: `nv`.
-   **WV**: input array `WV`.
-   **LDWV**: leading dimension of `WV`.
-   **WORK**: input array `WORK`.
-   **strideWORK**: stride length for `WORK`.
-   **lwork**: `lwork`.

#### dlaqr2.ndarray( wantt, wantz, N, ktop, kbot, nw, H, strideH1, strideH2, offsetH, iloz, ihiz, Z, strideZ1, strideZ2, offsetZ, ns, nd, SR, strideSR, offsetSR, SI, strideSI, offsetSI, V, strideV1, strideV2, offsetV, nh, T, strideT1, strideT2, offsetT, nv, WV, strideWV1, strideWV2, offsetWV, WORK, strideWORK, offsetWORK, lwork )

Performs aggressive early deflation on an upper Hessenberg matrix, using alternative indexing semantics.

```javascript
var dlaqr2 = require( '@stdlib/lapack/base/dlaqr2' );

var N = 3;
var H = discreteUniform( N * N, -10, 10, opts );
var Z = discreteUniform( N * N, -10, 10, opts );
var V = discreteUniform( N * N, -10, 10, opts );
var T = discreteUniform( N * N, -10, 10, opts );
var WV = discreteUniform( N * N, -10, 10, opts );
var SR = discreteUniform( N, -10, 10, opts );
var SI = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

dlaqr2.ndarray( 1, 1, N, 1, 1, 1, H, N, 1, 0, 1, 1, Z, N, 1, 0, 1, 1, SR, 1, 0, SI, 1, 0, V, N, 1, 0, 1, T, N, 1, 0, 1, WV, N, 1, 0, WORK, 1, 0, N );
```

The function has the following additional parameters:

-   **strideH1**: stride of dimension 1 of `H`.
-   **strideH2**: stride of dimension 2 of `H`.
-   **offsetH**: starting index for `H`.
-   **strideZ1**: stride of dimension 1 of `Z`.
-   **strideZ2**: stride of dimension 2 of `Z`.
-   **offsetZ**: starting index for `Z`.
-   **ns**: `ns`.
-   **nd**: `nd`.
-   **offsetSR**: starting index for `SR`.
-   **offsetSI**: starting index for `SI`.
-   **strideV1**: stride of dimension 1 of `V`.
-   **strideV2**: stride of dimension 2 of `V`.
-   **offsetV**: starting index for `V`.
-   **strideT1**: stride of dimension 1 of `T`.
-   **strideT2**: stride of dimension 2 of `T`.
-   **offsetT**: starting index for `T`.
-   **strideWV1**: stride of dimension 1 of `WV`.
-   **strideWV2**: stride of dimension 2 of `WV`.
-   **offsetWV**: starting index for `WV`.
-   **offsetWORK**: starting index for `WORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dlaqr2()` corresponds to the [LAPACK][lapack] level routine [`dlaqr2`][lapack-dlaqr2].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dlaqr2 = require( '@stdlib/lapack/base/dlaqr2' );

var N = 3;
var H = discreteUniform( N * N, -10, 10, opts );
var Z = discreteUniform( N * N, -10, 10, opts );
var V = discreteUniform( N * N, -10, 10, opts );
var T = discreteUniform( N * N, -10, 10, opts );
var WV = discreteUniform( N * N, -10, 10, opts );
var SR = discreteUniform( N, -10, 10, opts );
var SI = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

dlaqr2.ndarray( 1, 1, N, 1, 1, 1, H, N, 1, 0, 1, 1, Z, N, 1, 0, 1, 1, SR, 1, 0, SI, 1, 0, V, N, 1, 0, 1, T, N, 1, 0, 1, WV, N, 1, 0, WORK, 1, 0, N );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/dlaqr2.f; do not edit) -->

<section class="fortran-docs">

## Reference documentation

From the reference LAPACK 3.12.0 source of `DLAQR2`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

> Performs the orthogonal similarity transformation of a Hessenberg matrix to detect and deflate fully converged eigenvalues from a trailing principal submatrix (aggressive early deflation).

### Purpose

DLAQR2 is identical to DLAQR3 except that it avoids recursion by calling DLAHQR instead of DLAQR4.

Aggressive early deflation:

This subroutine accepts as input an upper Hessenberg matrix H and performs an orthogonal similarity transformation designed to detect and deflate fully converged eigenvalues from a trailing principal submatrix. On output H has been over- written by a new Hessenberg matrix that is a perturbation of an orthogonal similarity transformation of H. It is to be hoped that the final version of H has many zero subdiagonal entries.

### Arguments

#### WANTT `[in]`

_LOGICAL_

If .TRUE., then the Hessenberg matrix H is fully updated so that the quasi-triangular Schur factor may be computed (in cooperation with the calling subroutine). If .FALSE., then only enough of H is updated to preserve the eigenvalues.

#### WANTZ `[in]`

_LOGICAL_

If .TRUE., then the orthogonal matrix Z is updated so so that the orthogonal Schur factor may be computed (in cooperation with the calling subroutine). If .FALSE., then Z is not referenced.

#### N `[in]`

_INTEGER_

The order of the matrix H and (if `WANTZ` is .TRUE.) the order of the orthogonal matrix Z.

#### KTOP `[in]`

_INTEGER_

It is assumed that either `KTOP = 1` or $H(\mathrm{KTOP},\mathrm{KTOP}-1)=0$. `KBOT` and `KTOP` together determine an isolated block along the diagonal of the Hessenberg matrix.

#### KBOT `[in]`

_INTEGER_

It is assumed without a check that either `KBOT = N` or $H(\mathrm{KBOT}+1,\mathrm{KBOT})=0$. `KBOT` and `KTOP` together determine an isolated block along the diagonal of the Hessenberg matrix.

#### NW `[in]`

_INTEGER_

Deflation window size. $1 \le \mathrm{NW} \le (\mathrm{KBOT}-\mathrm{KTOP}+1)$.

#### H `[in,out]`

_DOUBLE PRECISION array, dimension (LDH,N)_

On input the initial N-by-N section of H stores the Hessenberg matrix undergoing aggressive early deflation. On output H has been transformed by an orthogonal similarity transformation, perturbed, and the returned to Hessenberg form that (it is to be hoped) has some zero subdiagonal entries.

#### LDH `[in]`

_INTEGER_

Leading dimension of H just as declared in the calling subroutine. $N \le \mathrm{LDH}$

#### ILOZ `[in]`

_INTEGER_

#### IHIZ `[in]`

_INTEGER_

Specify the rows of Z to which transformations must be applied if `WANTZ` is .TRUE.. $1 \le \mathrm{ILOZ} \le \mathrm{IHIZ} \le N$.

#### Z `[in,out]`

_DOUBLE PRECISION array, dimension (LDZ,N)_

IF `WANTZ` is .TRUE., then on output, the orthogonal similarity transformation mentioned above has been accumulated into `Z(ILOZ:IHIZ,ILOZ:IHIZ)` from the right. If `WANTZ` is .FALSE., then Z is unreferenced.

#### LDZ `[in]`

_INTEGER_

The leading dimension of Z just as declared in the calling subroutine. $1 \le \mathrm{LDZ}$.

#### NS `[out]`

_INTEGER_

The number of unconverged (ie approximate) eigenvalues returned in `SR` and `SI` that may be used as shifts by the calling subroutine.

#### ND `[out]`

_INTEGER_

The number of converged eigenvalues uncovered by this subroutine.

#### SR `[out]`

_DOUBLE PRECISION array, dimension (KBOT)_

#### SI `[out]`

_DOUBLE PRECISION array, dimension (KBOT)_

On output, the real and imaginary parts of approximate eigenvalues that may be used for shifts are stored in `SR(KBOT-ND-NS+1)` through `SR(KBOT-ND)` and `SI(KBOT-ND-NS+1)` through `SI(KBOT-ND)`, respectively. The real and imaginary parts of converged eigenvalues are stored in `SR(KBOT-ND+1)` through `SR(KBOT)` and `SI(KBOT-ND+1)` through `SI(KBOT)`, respectively.

#### V `[out]`

_DOUBLE PRECISION array, dimension (LDV,NW)_

An `NW`-by-`NW` work array.

#### LDV `[in]`

_INTEGER_

The leading dimension of V just as declared in the calling subroutine. $\mathrm{NW} \le \mathrm{LDV}$

#### NH `[in]`

_INTEGER_

The number of columns of T. $\mathrm{NH} \ge \mathrm{NW}$.

#### T `[out]`

_DOUBLE PRECISION array, dimension (LDT,NW)_

#### LDT `[in]`

_INTEGER_

The leading dimension of T just as declared in the calling subroutine. $\mathrm{NW} \le \mathrm{LDT}$

#### NV `[in]`

_INTEGER_

The number of rows of work array `WV` available for workspace. $\mathrm{NV} \ge \mathrm{NW}$.

#### WV `[out]`

_DOUBLE PRECISION array, dimension (LDWV,NW)_

#### LDWV `[in]`

_INTEGER_

The leading dimension of W just as declared in the calling subroutine. $\mathrm{NW} \le \mathrm{LDV}$

#### WORK `[out]`

_DOUBLE PRECISION array, dimension (LWORK)_

On exit, `WORK(1)` is set to an estimate of the optimal value of `LWORK` for the given values of N, `NW`, `KTOP` and `KBOT`.

#### LWORK `[in]`

_INTEGER_

The dimension of the work array `WORK`. $\mathrm{LWORK} = 2 \, \mathrm{NW}$ suffices, but greater efficiency may result from larger values of `LWORK`.

If `LWORK = -1`, then a workspace query is assumed; DLAQR2 only estimates the optimal workspace size for the given values of N, `NW`, `KTOP` and `KBOT`. The estimate is returned in `WORK(1)`. No error message related to `LWORK` is issued by XERBLA. Neither H nor Z are accessed.

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[lapack]: https://www.netlib.org/lapack/explore-html/

[lapack-dlaqr2]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dlaqr2.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->