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

# zlar1v

> Compute the (scaled) `r`-th column of the inverse of the submatrix in rows `b1` through `bn` of the tridiagonal matrix `L*D*L^T - lambda*I` (complex eigenvector container).

<section class="usage">

## Usage

```javascript
var zlar1v = require( '@stdlib/lapack/base/zlar1v' );
```

#### zlar1v( N, b1, bn, lambda, d, strideD, l, strideL, LD, strideLD, LLD, strideLLD, pivmin, gaptol, z, strideZ, wantnc, negcnt, ztz, mingma, r, ISUPPZ, strideISUPPZ, offsetISUPPZ, nrminv, resid, rqcorr, WORK, strideWORK )

Compute the twisted-factorization FP vector for a shifted tridiagonal `L*D*L^T - lambda*I`. The tridiagonal factors are real; the output vector is stored as complex to match the downstream back-transformation step used by `zstemr`/`zstegr`, with zero imaginary parts on return.

The function has the following parameters:

-   **N**: number of columns.
-   **b1**: b1.
-   **bn**: bn.
-   **lambda**: lambda.
-   **d**: input array.
-   **strideD**: stride length for `d`.
-   **l**: input array.
-   **strideL**: stride length for `l`.
-   **LD**: leading dimension of ``.
-   **strideLD**: stride length for `LD`.
-   **LLD**: input array.
-   **strideLLD**: stride length for `LLD`.
-   **pivmin**: pivmin.
-   **gaptol**: gaptol.
-   **z**: input array.
-   **strideZ**: stride length for `z`.
-   **wantnc**: wantnc.
-   **negcnt**: negcnt.
-   **ztz**: ztz.
-   **mingma**: mingma.
-   **r**: r.
-   **ISUPPZ**: input array.
-   **strideISUPPZ**: stride length for `ISUPPZ`.
-   **offsetISUPPZ**: starting index for `ISUPPZ`.
-   **nrminv**: nrminv.
-   **resid**: resid.
-   **rqcorr**: rqcorr.
-   **WORK**: output array.
-   **strideWORK**: stride length for `WORK`.

#### zlar1v.ndarray( N, b1, bn, lambda, d, strideD, offsetD, l, strideL, offsetL, LD, strideLD, offsetLD, LLD, strideLLD, offsetLLD, pivmin, gaptol, z, strideZ, offsetZ, wantnc, negcnt, ztz, mingma, r, ISUPPZ, strideISUPPZ, offsetISUPPZ, nrminv, resid, rqcorr, WORK, strideWORK, offsetWORK )

Compute the twisted-factorization FP vector for a shifted tridiagonal `L*D*L^T - lambda*I`. The tridiagonal factors are real; the output vector is stored as complex to match the downstream back-transformation step used by `zstemr`/`zstegr`, with zero imaginary parts on return., using alternative indexing semantics.

The function has the following additional parameters:

-   **N**: number of columns.
-   **b1**: b1.
-   **bn**: bn.
-   **lambda**: lambda.
-   **d**: input array.
-   **strideD**: stride length for `d`.
-   **offsetD**: starting index for `D`.
-   **l**: input array.
-   **strideL**: stride length for `l`.
-   **offsetL**: starting index for `L`.
-   **LD**: input array.
-   **strideLD**: stride length for `LD`.
-   **offsetLD**: starting index for `LD`.
-   **LLD**: input array.
-   **strideLLD**: stride length for `LLD`.
-   **offsetLLD**: starting index for `LLD`.
-   **pivmin**: pivmin.
-   **gaptol**: gaptol.
-   **z**: input array.
-   **strideZ**: stride length for `z`.
-   **offsetZ**: starting index for `Z`.
-   **wantnc**: wantnc.
-   **negcnt**: negcnt.
-   **ztz**: ztz.
-   **mingma**: mingma.
-   **r**: r.
-   **ISUPPZ**: input array.
-   **strideISUPPZ**: stride length for `ISUPPZ`.
-   **offsetISUPPZ**: starting index for `ISUPPZ`.
-   **nrminv**: nrminv.
-   **resid**: resid.
-   **rqcorr**: rqcorr.
-   **WORK**: output array.
-   **strideWORK**: stride length for `WORK`.
-   **offsetWORK**: starting index for `WORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   The tridiagonal factors `D`, `L`, `LD`, `LLD` are real; the output
    `Z` is a `Complex128Array` whose imaginary parts are always zero on
    return. The complex container matches the back-transformation step
    performed by `zstemr`/`zstegr`.
-   `r` is in/out: pass `0` to let the routine pick the best twist
    index automatically; pass a nonzero 1-based value to force that
    twist.
-   Scalar outputs (`negcnt`, `ztz`, `mingma`, `r`, `nrminv`, `resid`,
    `rqcorr`) are written to caller-supplied length-1 typed arrays.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var Complex128Array = require( '@stdlib/array/complex128' );
var zlar1v = require( '@stdlib/lapack/base/zlar1v' );

var D = new Float64Array( [ 4.0, 3.75, 3.7333333333333334, 3.732142857142857, 3.7320574162679425 ] );
var L = new Float64Array( [ 0.25, 0.26666666666666666, 0.26785714285714285, 0.26794258373205743, 0.0 ] );
var LD = new Float64Array( [ 1.0, 1.0, 1.0, 1.0, 0.0 ] );
var LLD = new Float64Array( [ 0.25, 0.26666666666666666, 0.26785714285714285, 0.26794258373205743, 0.0 ] );

var Z = new Complex128Array( 5 );
var WORK = new Float64Array( 20 );
var ISUPPZ = new Int32Array( 2 );
var negcnt = new Int32Array( 1 );
var ztz = new Float64Array( 1 );
var mingma = new Float64Array( 1 );
var r = new Int32Array( 1 );
var nrminv = new Float64Array( 1 );
var resid = new Float64Array( 1 );
var rqcorr = new Float64Array( 1 );

zlar1v( 5, 1, 5, 4.0 - Math.sqrt( 3.0 ), D, 1, L, 1, LD, 1, LLD, 1, 1e-300, 0.0, Z, 1, true, negcnt, ztz, mingma, r, ISUPPZ, 1, nrminv, resid, rqcorr, WORK, 1 );
console.log( Z );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/zlar1v.f; do not edit) -->

<section class="fortran-docs">

## Reference documentation

From the reference LAPACK 3.12.0 source of `ZLAR1V`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

> Computes the (scaled) r-th column of the inverse of the submatrix in rows b1 through bn of the tridiagonal matrix LDLT - λI.

### Purpose

ZLAR1V computes the (scaled) r-th column of the inverse of the sumbmatrix in rows `B1` through `BN` of the tridiagonal matrix L D $L^T - \sigma$ I. When $\sigma$ is close to an eigenvalue, the computed vector is an accurate eigenvector. Usually, r corresponds to the index where the eigenvector is largest in magnitude. The following steps accomplish this computation : (a) Stationary qd transform, L D $L^T - \sigma$ $I = L(+)$ `D(+)` $L(+)^T$, (b) Progressive qd transform, L D $L^T - \sigma$ $I = U(-)$ `D(-)` $U(-)^T$, (c) Computation of the diagonal elements of the inverse of

-   L D $L^T - \sigma$ I by combining the above transforms, and choosing
-   r as the index where the diagonal of the inverse is (one of the)
-   largest in magnitude.

(d) Computation of the (scaled) r-th column of the inverse using the

-   twisted factorization obtained by combining the top part of the
-   the stationary and the bottom part of the progressive transform.

### Arguments

#### N `[in]`

_INTEGER_

The order of the matrix L D $L^T$.

#### B1 `[in]`

_INTEGER_

First index of the submatrix of L D $L^T$.

#### BN `[in]`

_INTEGER_

Last index of the submatrix of L D $L^T$.

#### LAMBDA `[in]`

_DOUBLE PRECISION_

The shift. In order to compute an accurate eigenvector, `LAMBDA` should be a good approximation to an eigenvalue of L D $L^T$.

#### L `[in]`

_DOUBLE PRECISION array, dimension (N-1)_

The (n-1) subdiagonal elements of the unit bidiagonal matrix L, in elements 1 to N-1.

#### D `[in]`

_DOUBLE PRECISION array, dimension (N)_

The n diagonal elements of the diagonal matrix D.

#### LD `[in]`

_DOUBLE PRECISION array, dimension (N-1)_

The n-1 elements $L(i) \, D(i)$.

#### LLD `[in]`

_DOUBLE PRECISION array, dimension (N-1)_

The n-1 elements $L(i) \, L(i) \, D(i)$.

#### PIVMIN `[in]`

_DOUBLE PRECISION_

The minimum pivot in the Sturm sequence.

#### GAPTOL `[in]`

_DOUBLE PRECISION_

Tolerance that indicates when eigenvector entries are negligible w.r.t. their contribution to the residual.

#### Z `[in,out]`

_COMPLEX\*16 array, dimension (N)_

On input, all entries of Z must be set to 0. On output, Z contains the (scaled) r-th column of the inverse. The scaling is such that `Z(R)` equals 1.

#### WANTNC `[in]`

_LOGICAL_

Specifies whether `NEGCNT` has to be computed.

#### NEGCNT `[out]`

_INTEGER_

If `WANTNC` is .TRUE. then `NEGCNT` = the number of pivots \< pivmin in the matrix factorization L D $L^T$, and `NEGCNT = -1` otherwise.

#### ZTZ `[out]`

_DOUBLE PRECISION_

The square of the 2-norm of Z.

#### MINGMA `[out]`

_DOUBLE PRECISION_

The reciprocal of the largest (in magnitude) diagonal element of the inverse of L D $L^T - \sigma$ I.

#### R `[in,out]`

_INTEGER_

The twist index for the twisted factorization used to compute Z. On input, $0 \le R \le N$. If R is input as 0, R is set to the index where $(L D L^T - \sigma I)$^{-1} is largest in magnitude. If $1 \le R \le N$, R is unchanged. On output, R contains the twist index used to compute Z. Ideally, R designates the position of the maximum entry in the eigenvector.

#### ISUPPZ `[out]`

_INTEGER array, dimension (2)_

The support of the vector in Z, i.e., the vector Z is nonzero only in elements `ISUPPZ(1)` through ISUPPZ( 2 ).

#### NRMINV `[out]`

_DOUBLE PRECISION_

$\mathrm{NRMINV} = 1/\sqrt{ \mathrm{ZTZ} }$

#### RESID `[out]`

_DOUBLE PRECISION_

The residual of the FP vector. $\mathrm{RESID} = \lvert \mathrm{MINGMA} \rvert/\sqrt{ \mathrm{ZTZ} }$

#### RQCORR `[out]`

_DOUBLE PRECISION_

The Rayleigh Quotient correction to `LAMBDA`. $\mathrm{RQCORR} = \mathrm{MINGMA} \, \mathrm{TMP}$

#### WORK `[out]`

_DOUBLE PRECISION array, dimension (4\*N)_

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array
[mdn-float32array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array
[mdn-int32array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int32Array
[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->
